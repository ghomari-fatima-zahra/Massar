import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Mission } from '../../entities/mission.entity';
import { MissionStop } from '../../entities/mission-stop.entity';
import { DriverStatus, MissionStatus, VehicleStatus } from '../../common/enums';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { toCsv } from '../../common/utils/csv';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { QueryMissionDto } from './dto/query-mission.dto';
import { AssignMissionDto } from './dto/assign-mission.dto';
import { MissionsRepository } from './missions.repository';

const activeStatuses = [MissionStatus.EN_ATTENTE, MissionStatus.AFFECTEE, MissionStatus.CONFIRMEE, MissionStatus.EN_COURS];

@Injectable()
export class MissionsService {
  constructor(private readonly missions: MissionsRepository) {}

  async get(id: string) { return this.toResponse(await this.requireMission(id)); }

  async list(query: QueryMissionDto) {
    const qb = this.missions.repo.createQueryBuilder('mission').leftJoinAndSelect('mission.demandeur', 'demandeur').leftJoinAndSelect('mission.validator', 'validator').leftJoinAndSelect('mission.vehicle', 'vehicle').leftJoinAndSelect('mission.driver', 'driver').leftJoinAndSelect('mission.stops', 'stop').where('1=1').distinct(true);
    if (query.status) qb.andWhere('mission.status = :status', { status: query.status });
    if (query.type) qb.andWhere('mission.type = :type', { type: query.type });
    if (query.structure) qb.andWhere('demandeur.structure ILIKE :structure', { structure: `%${query.structure}%` });
    if (query.fromDate) qb.andWhere('mission.departure_date >= :fromDate', { fromDate: query.fromDate });
    if (query.toDate) qb.andWhere('mission.departure_date <= :toDate', { toDate: query.toDate });
    if (query.demandeurId) qb.andWhere('mission.demandeur_id = :demandeurId', { demandeurId: query.demandeurId });
    if (query.search) qb.andWhere('(mission.object ILIKE :search OR demandeur.name ILIKE :search OR demandeur.matricule ILIKE :search OR stop.name ILIKE :search)', { search: `%${query.search}%` });
    const sort = ['createdAt', 'departureDate', 'status', 'object'].includes(query.sort) ? query.sort : 'createdAt';
    qb.orderBy(`mission.${sort}`, query.order === 'ASC' ? 'ASC' : 'DESC');
    const [data, total] = await qb.skip((query.page - 1) * query.limit).take(query.limit).getManyAndCount();
    return { data: await Promise.all(data.map((mission) => this.toResponse(mission))), meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(dto: CreateMissionDto, currentUserId: string) {
    const demandeurId = dto.demandeurId ?? currentUserId;
    await this.ensureUser(demandeurId);
    const stops = this.normalizeStops(dto);
    const year = new Date(dto.departureDate).getUTCFullYear();
    const next = await this.missions.nextReference(year);
    const mission = this.missions.repo.create({ id: `M${year}-${String(Number(next?.next ?? 1)).padStart(3, '0')}`, demandeurId, type: dto.type, object: dto.object, departure: dto.departure, destination: dto.destination, roundTrip: dto.roundTrip ?? false, departureDate: dto.departureDate, returnDate: dto.returnDate ?? null, departureTime: dto.departureTime, returnTime: dto.returnTime ?? null, passengers: dto.passengers, vehicleNeeded: dto.vehicleNeeded, vehicleType: dto.vehicleType ?? null, status: MissionStatus.BROUILLON });
    const saved = await this.missions.repo.save(mission);
    await this.replaceStops(saved.id, stops);
    return this.get(saved.id);
  }

  async update(id: string, dto: UpdateMissionDto) {
    const mission = await this.requireMission(id);
    if (![MissionStatus.BROUILLON, MissionStatus.REJETEE].includes(mission.status)) throw new ConflictException(`Mission ${id} cannot be edited from status ${mission.status}`);
    const { stops, ...fields } = dto;
    Object.assign(mission, fields);
    await this.missions.repo.save(mission);
    if (stops) await this.replaceStops(id, this.normalizeStops({ ...dto, departure: dto.departure ?? mission.departure, destination: dto.destination ?? mission.destination, roundTrip: dto.roundTrip ?? mission.roundTrip }));
    return this.get(id);
  }

  async submit(id: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.EN_ATTENTE, [MissionStatus.BROUILLON]); return this.get((await this.missions.repo.save(mission)).id); }
  async validate(id: string, validatorId: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.VALIDEE, [MissionStatus.EN_ATTENTE]); mission.validatedBy = validatorId; mission.rejectionReason = null; return this.get((await this.missions.repo.save(mission)).id); }
  async reject(id: string, reason: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.REJETEE, [MissionStatus.EN_ATTENTE]); mission.rejectionReason = reason; return this.get((await this.missions.repo.save(mission)).id); }

  async assign(id: string, dto: AssignMissionDto) {
    const mission = await this.requireMission(id);
    this.transition(mission, MissionStatus.AFFECTEE, [MissionStatus.VALIDEE]);
    if (mission.vehicleNeeded && !dto.vehicleId) throw new ConflictException('A vehicle is required for this mission');
    if (dto.vehicleId) { const vehicle = await this.missions.vehicles.findOne({ where: { id: dto.vehicleId } }); if (!vehicle) throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`); if (![VehicleStatus.DISPONIBLE, VehicleStatus.AFFECTE].includes(vehicle.status)) throw new ConflictException(`Vehicle ${dto.vehicleId} is not available`); mission.vehicleId = vehicle.id; vehicle.status = VehicleStatus.AFFECTE; await this.missions.vehicles.save(vehicle); }
    if (dto.driverId) { const driver = await this.missions.drivers.findOne({ where: { id: dto.driverId } }); if (!driver) throw new NotFoundException(`Driver ${dto.driverId} not found`); if (driver.status !== DriverStatus.DISPONIBLE) throw new ConflictException(`Driver ${dto.driverId} is not available`); mission.driverId = driver.id; }
    if (mission.vehicleNeeded && !mission.driverId && !dto.driverId) throw new ConflictException('A driver is required for this mission');
    return this.get((await this.missions.repo.save(mission)).id);
  }

  async confirm(id: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.CONFIRMEE, [MissionStatus.AFFECTEE]); return this.get((await this.missions.repo.save(mission)).id); }
  async start(id: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.EN_COURS, [MissionStatus.CONFIRMEE]); return this.get((await this.missions.repo.save(mission)).id); }
  async complete(id: string) { const mission = await this.requireMission(id); this.transition(mission, MissionStatus.TERMINEE, [MissionStatus.EN_COURS]); if (mission.vehicleId) { const vehicle = await this.missions.vehicles.findOne({ where: { id: mission.vehicleId } }); if (vehicle) { vehicle.status = VehicleStatus.DISPONIBLE; await this.missions.vehicles.save(vehicle); } } return this.get((await this.missions.repo.save(mission)).id); }
  async cancel(id: string, reason: string) { const mission = await this.requireMission(id); if ([MissionStatus.TERMINEE, MissionStatus.ANNULEE].includes(mission.status)) throw new ConflictException(`Mission ${id} cannot be cancelled from status ${mission.status}`); mission.status = MissionStatus.ANNULEE; mission.cancellationReason = reason; return this.get((await this.missions.repo.save(mission)).id); }
  async remove(id: string) { const mission = await this.requireMission(id); await this.missions.repo.softRemove(mission); return { success: true }; }

  async exportCsv(query: QueryMissionDto) {
    const result = await this.list({ ...query, page: 1, limit: 100 } as QueryMissionDto);
    return toCsv(['id', 'employee', 'matricule', 'structure', 'type', 'object', 'departure', 'destination', 'departureDate', 'status', 'vehicleId', 'driverId'], result.data.map((m) => [m.id, m.employee, m.matricule, m.structure, m.type, m.object, m.departure, m.destination, m.departureDate, m.status, m.vehicleId, m.driverId]));
  }

  private async ensureUser(id: string) { const user = await this.missions.users.findOne({ where: { id } }); if (!user) throw new NotFoundException(`User ${id} not found`); return user; }
  private async requireMission(id: string) { const mission = await this.missions.findById(id); if (!mission) throw new NotFoundException(`Mission ${id} not found`); return mission; }
  private transition(mission: Mission, target: MissionStatus, allowed: MissionStatus[]) { if (!allowed.includes(mission.status)) throw new ConflictException(`Invalid mission transition: ${mission.status} -> ${target}`); mission.status = target; }
  private normalizeStops(dto: Pick<CreateMissionDto, 'stops' | 'departure' | 'destination' | 'roundTrip'>) { const input = dto.stops?.length ? dto.stops.map((stop, index) => ({ name: stop.name.trim(), sequence: stop.sequence ?? index + 1 })) : [{ name: dto.departure, sequence: 1 }, { name: dto.destination, sequence: 2 }]; const names = input.filter((stop) => stop.name); if (dto.roundTrip && names.length > 1 && names.at(-1)?.name !== names[0].name) names.push({ name: names[0].name, sequence: names.length + 1 }); return names.map((stop, index) => ({ ...stop, sequence: index + 1 })); }
  private async replaceStops(missionId: string, stops: Array<{ name: string; sequence: number }>) { await this.missions.stops.delete({ missionId }); await this.missions.stops.save(stops.map((stop) => this.missions.stops.create({ missionId, ...stop }))); }
  private async toResponse(mission: Mission) { const stops = [...(mission.stops ?? [])].sort((a, b) => a.sequence - b.sequence); return { id: mission.id, demandeurId: mission.demandeurId, employee: mission.demandeur?.name ?? '', matricule: mission.demandeur?.matricule ?? '', structure: mission.demandeur?.structure ?? '', type: mission.type, object: mission.object, departure: mission.departure, destination: mission.destination, route: { roundTrip: mission.roundTrip, stops: stops.map((stop) => ({ id: stop.id, name: stop.name, sequence: stop.sequence })) }, departureDate: mission.departureDate, returnDate: mission.returnDate, departureTime: mission.departureTime, returnTime: mission.returnTime, passengers: mission.passengers, vehicleNeeded: mission.vehicleNeeded, vehicleType: mission.vehicleType ?? undefined, status: mission.status, vehicleId: mission.vehicleId ?? undefined, driverId: mission.driverId ?? undefined, createdAt: mission.createdAt, validatedBy: mission.validator?.name ?? mission.validatedBy ?? undefined, rejectionReason: mission.rejectionReason ?? undefined, cancellationReason: mission.cancellationReason ?? undefined, vehicle: mission.vehicle ? { id: mission.vehicle.id, registration: mission.vehicle.registration, brand: mission.vehicle.brand, model: mission.vehicle.model } : undefined, driver: mission.driver ? { id: mission.driver.id, name: mission.driver.name, matricule: mission.driver.matricule } : undefined }; }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleStatus } from '../../common/enums';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { toCsv } from '../../common/utils/csv';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateFuelLogDto, CreateServiceEntryDto, UpdateWearDto } from './dto/telemetry.dto';
import { VehiclesRepository } from './vehicles.repository';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehicles: VehiclesRepository) {}

  async get(id: string) { return this.toResponse(await this.requireEntity(id)); }

  async list(query: QueryVehicleDto) {
    const qb = this.vehicles.repo.createQueryBuilder('vehicle').orderBy(`vehicle.${query.sort === 'brand' ? 'brand' : 'createdAt'}`, query.order === 'ASC' ? 'ASC' : 'DESC');
    if (query.category) qb.andWhere('vehicle.category = :category', { category: query.category });
    if (query.status) qb.andWhere('vehicle.status = :status', { status: query.status });
    if (query.type) qb.andWhere('vehicle.type ILIKE :type', { type: `%${query.type}%` });
    if (query.search) qb.andWhere('(vehicle.registration ILIKE :search OR vehicle.brand ILIKE :search OR vehicle.model ILIKE :search OR vehicle.gps ILIKE :search)', { search: `%${query.search}%` });
    const total = await qb.getCount();
    const data = await qb.skip((query.page - 1) * query.limit).take(query.limit).getMany();
    return { data: data.map((vehicle) => this.toResponse(vehicle)), meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(dto: CreateVehicleDto) {
    const vehicle = this.vehicles.repo.create({ ...dto, id: `V${Date.now()}` });
    const saved = await this.vehicles.repo.save(vehicle);
    await this.ensureTelemetry(saved.id);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateVehicleDto) { const vehicle = await this.requireEntity(id); Object.assign(vehicle, dto); return this.toResponse(await this.vehicles.repo.save(vehicle)); }
  async changeStatus(id: string, status: VehicleStatus) { const vehicle = await this.requireEntity(id); vehicle.status = status; return this.toResponse(await this.vehicles.repo.save(vehicle)); }
  async remove(id: string) { const vehicle = await this.requireEntity(id); await this.vehicles.repo.remove(vehicle); return { success: true }; }

  async telemetry(id: string) {
    await this.requireEntity(id);
    const telemetry = await this.ensureTelemetry(id);
    const services = await this.vehicles.services.find({ where: { vehicleId: id }, order: { date: 'DESC' } });
    const fuelLogs = await this.vehicles.fuel.find({ where: { vehicleId: id }, order: { date: 'DESC' } });
    const usage = await this.vehicles.usage.find({ where: { vehicleId: id }, order: { month: 'ASC' } });
    const monthlyKm = usage.slice(-12).map((row) => row.km);
    const monthlyLabels = usage.slice(-12).map((row) => new Date(`${row.month}T00:00:00`).toLocaleDateString('fr-FR', { month: 'short' }));
    const lastKm = monthlyKm.at(-1) ?? 0;
    return { vehicleId: id, odometerKm: telemetry.odometerKm, monthlyKm, monthlyLabels, fuelLevelPct: telemetry.fuelLevelPct, avgConsumption: Number(telemetry.avgConsumption), monthlyFuelDA: Math.round((lastKm / 100) * Number(telemetry.avgConsumption) * 45.2), healthScore: telemetry.healthScore, brakeWearPct: telemetry.brakeWearPct, tireWearPct: telemetry.tireWearPct, oilLifePct: telemetry.oilLifePct, nextServiceKm: telemetry.nextServiceKm, nextServiceDays: telemetry.nextServiceDays, updatedAt: telemetry.updatedAt, services, fuelLogs };
  }

  async addService(id: string, dto: CreateServiceEntryDto) { await this.requireEntity(id); return this.vehicles.services.save(this.vehicles.services.create({ ...dto, id: `S-${id}-${Date.now()}`, vehicleId: id })); }
  async addFuel(id: string, dto: CreateFuelLogDto) { await this.requireEntity(id); return this.vehicles.fuel.save(this.vehicles.fuel.create({ ...dto, id: `F-${id}-${Date.now()}`, vehicleId: id })); }
  async updateWear(id: string, dto: UpdateWearDto) { const telemetry = await this.ensureTelemetry(id); Object.assign(telemetry, dto); return this.vehicles.telemetry.save(telemetry); }

  async exportCsv(query: QueryVehicleDto) {
    const list = await this.list({ ...query, page: 1, limit: 100 } as QueryVehicleDto);
    return toCsv(['id', 'category', 'registration', 'gps', 'brand', 'model', 'type', 'capacity', 'status', 'lastInspection', 'nextInspection'], list.data.map((vehicle) => [vehicle.id, vehicle.category, vehicle.registration, vehicle.gps, vehicle.brand, vehicle.model, vehicle.type, vehicle.capacity, vehicle.status, vehicle.lastInspection, vehicle.nextInspection]));
  }

  private async requireEntity(id: string) { const vehicle = await this.vehicles.findById(id); if (!vehicle) throw new NotFoundException(`Vehicle ${id} not found`); return vehicle; }
  private toResponse(vehicle: Vehicle) { return { id: vehicle.id, category: vehicle.category, registration: vehicle.registration, gps: vehicle.gps, brand: vehicle.brand, model: vehicle.model, type: vehicle.type, capacity: vehicle.capacity, status: vehicle.status, lastInspection: vehicle.lastInspection, nextInspection: vehicle.nextInspection, createdAt: vehicle.createdAt, updatedAt: vehicle.updatedAt }; }
  private async ensureTelemetry(vehicleId: string) { let telemetry = await this.vehicles.telemetry.findOne({ where: { vehicleId } }); if (!telemetry) telemetry = await this.vehicles.telemetry.save(this.vehicles.telemetry.create({ vehicleId, odometerKm: 0, fuelLevelPct: 100, avgConsumption: 0, healthScore: 100, brakeWearPct: 0, tireWearPct: 0, oilLifePct: 100, nextServiceKm: 5000, nextServiceDays: 180 })); return telemetry; }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Driver } from '../../entities/driver.entity';
import { DriverEffectiveStatus, DriverStatus } from '../../common/enums';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { toCsv } from '../../common/utils/csv';
import { CreateDriverDto } from './dto/create-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriversRepository } from './drivers.repository';

@Injectable()
export class DriversService {
  constructor(private readonly drivers: DriversRepository) {}

  async get(id: string) {
    const driver = await this.drivers.findById(id);
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return this.toResponse(driver);
  }

  async list(query: QueryDriverDto) {
    const qb = this.drivers.repo.createQueryBuilder('driver').orderBy('driver.name', query.order === 'ASC' ? 'ASC' : 'DESC');
    if (query.status) qb.andWhere('driver.status = :status', { status: query.status });
    if (query.licenceCategory) qb.andWhere(':category = ANY(driver.licence_categories)', { category: query.licenceCategory });
    if (query.search) qb.andWhere('(driver.name ILIKE :search OR driver.matricule ILIKE :search OR driver.phone ILIKE :search)', { search: `%${query.search}%` });
    if (query.expiringSoon) qb.andWhere("driver.licence_expiry <= CURRENT_DATE + INTERVAL '60 days'");
    const total = await qb.getCount();
    const drivers = await qb.skip((query.page - 1) * query.limit).take(query.limit).getMany();
    return { data: await Promise.all(drivers.map((driver) => this.toResponse(driver))), meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(dto: CreateDriverDto) {
    const driver = this.drivers.repo.create({ ...dto, id: `D${Date.now()}` });
    return this.toResponse(await this.drivers.repo.save(driver));
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.requireEntity(id);
    Object.assign(driver, dto);
    return this.toResponse(await this.drivers.repo.save(driver));
  }

  async remove(id: string) { const driver = await this.requireEntity(id); await this.drivers.repo.remove(driver); return { success: true }; }

  async exportCsv(query: QueryDriverDto) {
    const list = await this.list({ ...query, page: 1, limit: 100 } as QueryDriverDto);
    return toCsv(['id', 'name', 'matricule', 'licenceCategories', 'licenceExpiry', 'phone', 'status', 'storedStatus'], list.data.map((driver) => [driver.id, driver.name, driver.matricule, driver.licenceCategories.join('|'), driver.licenceExpiry, driver.phone, driver.status, driver.storedStatus]));
  }

  private async requireEntity(id: string) { const driver = await this.drivers.findById(id); if (!driver) throw new NotFoundException(`Driver ${id} not found`); return driver; }
  private async toResponse(driver: Driver) {
    const active = driver.status === DriverStatus.DISPONIBLE && (await this.drivers.hasActiveMission(driver.id)) > 0;
    const effectiveStatus = active ? DriverEffectiveStatus.EN_MISSION : driver.status as unknown as DriverEffectiveStatus;
    return { id: driver.id, name: driver.name, matricule: driver.matricule, licenceCategories: driver.licenceCategories, licenceExpiry: driver.licenceExpiry, phone: driver.phone, status: effectiveStatus, effectiveStatus, storedStatus: driver.status };
  }
}

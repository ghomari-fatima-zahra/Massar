import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FuelLog } from '../../entities/fuel-log.entity';
import { MonthlyUsage } from '../../entities/monthly-usage.entity';
import { ServiceEntry } from '../../entities/service-entry.entity';
import { VehicleTelemetry } from '../../entities/vehicle-telemetry.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Injectable()
export class VehiclesRepository {
  constructor(@InjectRepository(Vehicle) readonly repo: Repository<Vehicle>, @InjectRepository(VehicleTelemetry) readonly telemetry: Repository<VehicleTelemetry>, @InjectRepository(ServiceEntry) readonly services: Repository<ServiceEntry>, @InjectRepository(FuelLog) readonly fuel: Repository<FuelLog>, @InjectRepository(MonthlyUsage) readonly usage: Repository<MonthlyUsage>) {}
  findById(id: string) { return this.repo.findOne({ where: { id } }); }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelLog } from '../../entities/fuel-log.entity';
import { MonthlyUsage } from '../../entities/monthly-usage.entity';
import { ServiceEntry } from '../../entities/service-entry.entity';
import { VehicleTelemetry } from '../../entities/vehicle-telemetry.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehiclesController } from './vehicles.controller';
import { VehiclesRepository } from './vehicles.repository';
import { VehiclesService } from './vehicles.service';

@Module({ imports: [TypeOrmModule.forFeature([Vehicle, VehicleTelemetry, ServiceEntry, FuelLog, MonthlyUsage])], controllers: [VehiclesController], providers: [VehiclesRepository, VehiclesService], exports: [VehiclesRepository, VehiclesService] })
export class VehiclesModule {}

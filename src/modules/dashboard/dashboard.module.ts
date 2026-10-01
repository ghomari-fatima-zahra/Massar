import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../entities/driver.entity';
import { Mission } from '../../entities/mission.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({ imports: [TypeOrmModule.forFeature([Mission, Vehicle, Driver])], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}

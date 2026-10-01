import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../entities/driver.entity';
import { MissionStop } from '../../entities/mission-stop.entity';
import { Mission } from '../../entities/mission.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { MissionsController } from './missions.controller';
import { MissionsRepository } from './missions.repository';
import { MissionsService } from './missions.service';

@Module({ imports: [TypeOrmModule.forFeature([Mission, MissionStop, User, Vehicle, Driver])], controllers: [MissionsController], providers: [MissionsRepository, MissionsService], exports: [MissionsRepository, MissionsService] })
export class MissionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../entities/driver.entity';
import { Mission } from '../../entities/mission.entity';
import { DriversController } from './drivers.controller';
import { DriversRepository } from './drivers.repository';
import { DriversService } from './drivers.service';

@Module({ imports: [TypeOrmModule.forFeature([Driver, Mission])], controllers: [DriversController], providers: [DriversRepository, DriversService], exports: [DriversRepository, DriversService] })
export class DriversModule {}

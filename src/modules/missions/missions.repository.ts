import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../../entities/driver.entity';
import { Mission } from '../../entities/mission.entity';
import { MissionStop } from '../../entities/mission-stop.entity';
import { User } from '../../entities/user.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Injectable()
export class MissionsRepository {
  constructor(@InjectRepository(Mission) readonly repo: Repository<Mission>, @InjectRepository(MissionStop) readonly stops: Repository<MissionStop>, @InjectRepository(User) readonly users: Repository<User>, @InjectRepository(Vehicle) readonly vehicles: Repository<Vehicle>, @InjectRepository(Driver) readonly drivers: Repository<Driver>) {}
  findById(id: string) { return this.repo.findOne({ where: { id }, relations: { demandeur: true, vehicle: true, driver: true, validator: true, stops: true } }); }
  nextReference(year: number) { return this.repo.createQueryBuilder('mission').withDeleted().select("COALESCE(MAX(CAST(SUBSTRING(mission.id FROM 7) AS INTEGER)), 0) + 1", 'next').where('mission.id LIKE :prefix', { prefix: `M${year}-%` }).getRawOne<{ next: string }>(); }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../../entities/driver.entity';
import { Mission } from '../../entities/mission.entity';

@Injectable()
export class DriversRepository {
  constructor(@InjectRepository(Driver) readonly repo: Repository<Driver>, @InjectRepository(Mission) readonly missions: Repository<Mission>) {}
  findById(id: string) { return this.repo.findOne({ where: { id } }); }
  hasActiveMission(id: string) { return this.missions.createQueryBuilder('mission').where('mission.driver_id = :id', { id }).andWhere('mission.status IN (:...statuses)', { statuses: ['en_attente', 'affectee', 'confirmee', 'en_cours'] }).getCount(); }
}

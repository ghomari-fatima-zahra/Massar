import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(@InjectRepository(Notification) readonly repo: Repository<Notification>) {}
  findVisible(id: string, userId: string) { return this.repo.createQueryBuilder('notification').where('notification.id = :id', { id }).andWhere('(notification.user_id IS NULL OR notification.user_id = :userId)', { userId }).getOne(); }
}

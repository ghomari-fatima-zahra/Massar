import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '../../entities/notification.entity';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notifications: NotificationsRepository) {}

  async list(userId: string, query: QueryNotificationDto) {
    const qb = this.notifications.repo.createQueryBuilder('notification').where('(notification.user_id IS NULL OR notification.user_id = :userId)', { userId }).orderBy('notification.createdAt', 'DESC');
    if (query.unread) qb.andWhere('notification.read = false');
    const total = await qb.getCount();
    const data = await qb.skip((query.page - 1) * query.limit).take(query.limit).getMany();
    const unreadCount = await this.notifications.repo.createQueryBuilder('notification').where('(notification.user_id IS NULL OR notification.user_id = :userId)', { userId }).andWhere('notification.read = false',).getCount();
    return { data: data.map((item) => this.toResponse(item)), unreadCount, meta: paginationMeta(query.page, query.limit, total) };
  }

  async create(dto: CreateNotificationDto) { const notification = this.notifications.repo.create({ ...dto, id: `N${Date.now()}`, userId: dto.userId ?? null, read: false }); return this.toResponse(await this.notifications.repo.save(notification)); }
  async markRead(id: string, userId: string) { const notification = await this.notifications.findVisible(id, userId); if (!notification) throw new NotFoundException(`Notification ${id} not found`); notification.read = true; return this.toResponse(await this.notifications.repo.save(notification)); }
  async markAllRead(userId: string) { await this.notifications.repo.createQueryBuilder().update(Notification).set({ read: true }).where('(user_id IS NULL OR user_id = :userId)', { userId }).andWhere('read = false').execute(); return { success: true }; }
  private toResponse(item: Notification) { return { id: item.id, title: item.title, body: item.body, type: item.type, read: item.read, userId: item.userId, createdAt: item.createdAt }; }
}

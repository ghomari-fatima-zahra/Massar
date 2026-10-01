import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications') @ApiBearerAuth() @Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() list(@Req() request: Request & { user: { id: string } }, @Query() query: QueryNotificationDto) { return this.service.list(request.user.id, query); }
  @Roles(UserRole.ADMIN) @Post() create(@Body() dto: CreateNotificationDto) { return this.service.create(dto); }
  @Patch('read-all') all(@Req() request: Request & { user: { id: string } }) { return this.service.markAllRead(request.user.id); }
  @Patch(':id/read') read(@Param('id') id: string, @Req() request: Request & { user: { id: string } }) { return this.service.markRead(id, request.user.id); }
}

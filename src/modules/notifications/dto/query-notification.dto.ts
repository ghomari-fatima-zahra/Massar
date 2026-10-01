import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryNotificationDto extends PaginationDto { @ApiPropertyOptional({ type: Boolean }) @IsOptional() @Type(() => Boolean) @IsBoolean() unread?: boolean; }

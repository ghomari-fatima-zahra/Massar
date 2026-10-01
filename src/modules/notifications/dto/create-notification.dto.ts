import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../../../common/enums';

export class CreateNotificationDto {
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() body!: string;
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type!: NotificationType;
  @ApiPropertyOptional({ description: 'Omit for a broadcast notification' }) @IsOptional() @IsString() userId?: string;
}

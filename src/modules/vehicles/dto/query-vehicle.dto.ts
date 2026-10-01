import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VehicleCategory, VehicleStatus } from '../../../common/enums';

export class QueryVehicleDto extends PaginationDto {
  @ApiPropertyOptional({ enum: VehicleCategory }) @IsOptional() @IsEnum(VehicleCategory) category?: VehicleCategory;
  @ApiPropertyOptional({ enum: VehicleStatus }) @IsOptional() @IsEnum(VehicleStatus) status?: VehicleStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DriverStatus, LicenceCategory } from '../../../common/enums';

export class QueryDriverDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DriverStatus }) @IsOptional() @IsEnum(DriverStatus) status?: DriverStatus;
  @ApiPropertyOptional({ enum: LicenceCategory }) @IsOptional() @IsEnum(LicenceCategory) licenceCategory?: LicenceCategory;
  @ApiPropertyOptional({ type: Boolean }) @IsOptional() @Type(() => Boolean) @IsBoolean() expiringSoon?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

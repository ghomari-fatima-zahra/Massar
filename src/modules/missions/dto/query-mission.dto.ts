import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { MissionStatus, MissionType } from '../../../common/enums';

export class QueryMissionDto extends PaginationDto {
  @ApiPropertyOptional({ enum: MissionStatus }) @IsOptional() @IsEnum(MissionStatus) status?: MissionStatus;
  @ApiPropertyOptional({ enum: MissionType }) @IsOptional() @IsEnum(MissionType) type?: MissionType;
  @ApiPropertyOptional() @IsOptional() @IsString() structure?: string;
  @ApiPropertyOptional({ description: 'Inclusive departure date lower bound' }) @IsOptional() @IsDateString() fromDate?: string;
  @ApiPropertyOptional({ description: 'Inclusive departure date upper bound' }) @IsOptional() @IsDateString() toDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() demandeurId?: string;
}

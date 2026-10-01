import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MissionType } from '../../../common/enums';
import { MissionStopDto } from './mission-stop.dto';

export class CreateMissionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() demandeurId?: string;
  @ApiProperty({ enum: MissionType }) @IsEnum(MissionType) type!: MissionType;
  @ApiProperty() @IsString() object!: string;
  @ApiProperty() @IsString() departure!: string;
  @ApiProperty() @IsString() destination!: string;
  @ApiProperty({ type: String, format: 'date' }) @IsDateString() departureDate!: string;
  @ApiPropertyOptional({ type: String, format: 'date' }) @IsOptional() @IsDateString() returnDate?: string;
  @ApiProperty() @IsString() departureTime!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() returnTime?: string;
  @ApiProperty({ minimum: 1, maximum: 1000 }) @IsInt() @Min(1) @Max(1000) passengers!: number;
  @ApiProperty() @IsBoolean() vehicleNeeded!: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() vehicleType?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() roundTrip?: boolean;
  @ApiPropertyOptional({ type: MissionStopDto, isArray: true }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MissionStopDto) stops?: MissionStopDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { VehicleCategory, VehicleStatus } from '../../../common/enums';

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleCategory }) @IsEnum(VehicleCategory) category!: VehicleCategory;
  @ApiProperty() @IsString() registration!: string;
  @ApiProperty() @IsString() gps!: string;
  @ApiProperty() @IsString() brand!: string;
  @ApiProperty() @IsString() model!: string;
  @ApiProperty() @IsString() type!: string;
  @ApiProperty({ minimum: 1, maximum: 100 }) @IsInt() @Min(1) @Max(100) capacity!: number;
  @ApiProperty({ enum: VehicleStatus, required: false }) @IsEnum(VehicleStatus) status: VehicleStatus = VehicleStatus.DISPONIBLE;
  @ApiProperty() @IsDateString() lastInspection!: string;
  @ApiProperty() @IsDateString() nextInspection!: string;
}

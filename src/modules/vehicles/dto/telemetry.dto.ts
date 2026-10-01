import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateServiceEntryDto {
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty() @IsInt() @Min(0) km!: number;
  @ApiProperty() @IsString() type!: string;
  @ApiProperty() @IsString() center!: string;
  @ApiProperty() @IsInt() @Min(0) costDA!: number;
}

export class CreateFuelLogDto {
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty() @IsNumber() @Min(0.1) liters!: number;
  @ApiProperty() @IsInt() @Min(0) costDA!: number;
  @ApiProperty() @IsInt() @Min(0) km!: number;
}

export class UpdateWearDto {
  @ApiProperty({ required: false }) @IsInt() @Min(0) @Max(100) brakeWearPct?: number;
  @ApiProperty({ required: false }) @IsInt() @Min(0) @Max(100) tireWearPct?: number;
  @ApiProperty({ required: false }) @IsInt() @Min(0) @Max(100) oilLifePct?: number;
  @ApiProperty({ required: false }) @IsInt() @Min(0) @Max(100) fuelLevelPct?: number;
  @ApiProperty({ required: false }) @IsInt() @Min(0) @Max(100) healthScore?: number;
  @ApiProperty({ required: false }) @IsInt() @Min(0) odometerKm?: number;
}

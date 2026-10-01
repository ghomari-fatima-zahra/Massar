import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VehicleStatus } from '../../../common/enums';
export class VehicleStatusDto { @ApiProperty({ enum: VehicleStatus }) @IsEnum(VehicleStatus) status!: VehicleStatus; }

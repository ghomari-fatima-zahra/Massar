import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsString, ArrayMinSize } from 'class-validator';
import { DriverStatus, LicenceCategory } from '../../../common/enums';

export class CreateDriverDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() matricule!: string;
  @ApiProperty({ enum: LicenceCategory, isArray: true }) @IsArray() @ArrayMinSize(1) @IsEnum(LicenceCategory, { each: true }) licenceCategories!: LicenceCategory[];
  @ApiProperty() @IsDateString() licenceExpiry!: string;
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty({ enum: DriverStatus, required: false }) @IsEnum(DriverStatus) status: DriverStatus = DriverStatus.DISPONIBLE;
}

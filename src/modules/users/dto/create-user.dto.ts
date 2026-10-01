import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() matricule!: string;
  @ApiProperty({ enum: UserRole, required: false }) @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @ApiProperty() @IsString() structure!: string;
  @ApiProperty({ enum: UserStatus, required: false }) @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}

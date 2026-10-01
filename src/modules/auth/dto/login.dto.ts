import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Email, matricule, or identifier' }) @IsOptional() @IsString() identifier?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() matricule?: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}

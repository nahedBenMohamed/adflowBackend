import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ description: 'User birth date' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'User employment date' })
  @IsOptional()
  @IsString()
  employmentDate?: string;

  @ApiPropertyOptional({ description: 'Working time from of the department', nullable: true })
  @IsOptional()
  @IsString()
  workingTimeFrom?: string | null;

  @ApiPropertyOptional({ description: 'Working time to of the department', nullable: true })
  @IsOptional()
  @IsString()
  workingTimeTo?: string | null;
}

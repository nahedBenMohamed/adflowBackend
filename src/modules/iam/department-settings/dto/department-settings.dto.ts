import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class DepartmentSettingsDto {
  @ApiProperty({ description: 'Department ID' })
  @IsNumber()
  departmentId: number;

  @ApiPropertyOptional({ description: 'Working days of the department', nullable: true })
  @IsOptional()
  @IsArray()
  workingDays?: string[] | null;

  @ApiPropertyOptional({ description: 'Working time from of the department', nullable: true })
  @IsOptional()
  @IsString()
  workingTimeFrom?: string | null;

  @ApiPropertyOptional({ description: 'Working time to of the department', nullable: true })
  @IsOptional()
  @IsString()
  workingTimeTo?: string | null;

  @ApiPropertyOptional({ description: 'Time zone of the department', nullable: true })
  @IsOptional()
  @IsString()
  timeZone?: string | null;
}

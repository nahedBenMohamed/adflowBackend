import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { DepartmentSettingsDto } from '../../department-settings';

export class DepartmentDto {
  @ApiProperty({ description: 'Department ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Department name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Parent department ID', nullable: true })
  @IsOptional()
  @IsNumber()
  parentId?: number | null;

  @ApiProperty({ description: 'Activity of the department' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Department settings', type: DepartmentSettingsDto, nullable: true })
  @IsOptional()
  settings: DepartmentSettingsDto | null;

  @ApiProperty({ description: 'Subordinates of the department', type: [DepartmentDto], nullable: true })
  @IsOptional()
  @IsArray()
  subordinates: DepartmentDto[] | null;
}

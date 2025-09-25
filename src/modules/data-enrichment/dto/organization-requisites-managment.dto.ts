import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class OrganizationRequisitesManagmentDto {
  @ApiPropertyOptional({ description: 'Name', nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ description: 'Job title', nullable: true })
  @IsOptional()
  @IsString()
  post?: string | null;

  @ApiPropertyOptional({ description: 'Start date', nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;
}

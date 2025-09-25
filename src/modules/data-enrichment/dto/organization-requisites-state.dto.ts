import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { OrgStatus } from '../enums';

export class OrganizationRequisitesStateDto {
  @ApiPropertyOptional({ description: 'Registration date', nullable: true })
  @IsOptional()
  @IsDateString()
  registrationDate?: string | null;

  @ApiPropertyOptional({ description: 'Liquidation date', nullable: true })
  @IsOptional()
  @IsDateString()
  liquidationDate?: string | null;

  @ApiPropertyOptional({ enum: OrgStatus, description: 'Status', nullable: true })
  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus | null;
}

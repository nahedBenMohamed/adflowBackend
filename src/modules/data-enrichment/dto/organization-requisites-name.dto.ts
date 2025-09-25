import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OrganizationRequisitesNameDto {
  @ApiPropertyOptional({ description: 'Full name', nullable: true })
  @IsOptional()
  @IsString()
  full?: string | null;

  @ApiPropertyOptional({ description: 'Short name', nullable: true })
  @IsOptional()
  @IsString()
  short?: string | null;
}

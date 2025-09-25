import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class OrganizationRequisitesAddressDto {
  @ApiPropertyOptional({ description: 'Unrestricted value', nullable: true })
  @IsOptional()
  @IsString()
  unrestrictedValue?: string | null;
}

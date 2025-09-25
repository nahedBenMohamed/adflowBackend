import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { OrgBranchType, OrgType } from '../enums';
import { OrganizationRequisitesNameDto } from './organization-requisites-name.dto';
import { FioDto } from './fio.dto';
import { OrganizationRequisitesManagmentDto } from './organization-requisites-managment.dto';
import { OrganizationRequisitesStateDto } from './organization-requisites-state.dto';
import { OrganizationRequisitesAddressDto } from './organization-requisites-address.dto';

export class OrganizationRequisitesDto {
  @ApiPropertyOptional({ description: 'Organization name', nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;

  @ApiPropertyOptional({ description: 'Organization name unrestricted', nullable: true })
  @IsOptional()
  @IsString()
  unrestrictedValue?: string | null;

  @ApiPropertyOptional({ description: 'INN', nullable: true })
  @IsOptional()
  @IsString()
  inn?: string | null;

  @ApiPropertyOptional({ description: 'KPP', nullable: true })
  @IsOptional()
  @IsString()
  kpp?: string | null;

  @ApiPropertyOptional({ description: 'OGRN', nullable: true })
  @IsOptional()
  @IsString()
  ogrn?: string | null;

  @ApiPropertyOptional({ enum: OrgType, description: 'Type', nullable: true })
  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType | null;

  @ApiPropertyOptional({
    type: OrganizationRequisitesNameDto,
    description: 'Organization name details',
    nullable: true,
  })
  @IsOptional()
  name?: OrganizationRequisitesNameDto | null;

  @ApiPropertyOptional({ type: FioDto, description: 'FIO', nullable: true })
  @IsOptional()
  fio?: FioDto | null;

  @ApiPropertyOptional({ type: OrganizationRequisitesManagmentDto, description: 'Management', nullable: true })
  @IsOptional()
  management?: OrganizationRequisitesManagmentDto | null;

  @ApiPropertyOptional({ description: 'Branch count', nullable: true })
  @IsOptional()
  @IsNumber()
  branchCount?: number | null;

  @ApiPropertyOptional({ enum: OrgBranchType, description: 'Branch type', nullable: true })
  @IsOptional()
  @IsEnum(OrgBranchType)
  branchType?: OrgBranchType | null;

  @ApiPropertyOptional({ type: OrganizationRequisitesAddressDto, description: 'Address', nullable: true })
  @IsOptional()
  address?: OrganizationRequisitesAddressDto | null;

  @ApiPropertyOptional({ type: OrganizationRequisitesStateDto, description: 'State', nullable: true })
  @IsOptional()
  state?: OrganizationRequisitesStateDto | null;

  @ApiPropertyOptional({ description: 'OKATO', nullable: true })
  @IsOptional()
  @IsString()
  okato?: string | null;

  @ApiPropertyOptional({ description: 'OKTMO', nullable: true })
  @IsOptional()
  @IsString()
  oktmo?: string | null;

  @ApiPropertyOptional({ description: 'OKPO', nullable: true })
  @IsOptional()
  @IsString()
  okpo?: string | null;

  @ApiPropertyOptional({ description: 'OKOGU', nullable: true })
  @IsOptional()
  @IsString()
  okogu?: string | null;

  @ApiPropertyOptional({ description: 'OKFS', nullable: true })
  @IsOptional()
  @IsString()
  okfs?: string | null;

  @ApiPropertyOptional({ description: 'OKVED', nullable: true })
  @IsOptional()
  @IsString()
  okved?: string | null;

  @ApiPropertyOptional({ description: 'Employee count', nullable: true })
  @IsOptional()
  @IsNumber()
  employeeCount?: number | null;

  @ApiPropertyOptional({ type: [String], description: 'Founders', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  founders?: string[] | null;

  @ApiPropertyOptional({ type: [String], description: 'Managers', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  managers?: string[] | null;

  @ApiPropertyOptional({ description: 'Capital', nullable: true })
  @IsOptional()
  @IsString()
  capital?: string | null;

  @ApiPropertyOptional({ type: [String], description: 'Licenses', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  licenses?: string[] | null;

  @ApiPropertyOptional({ type: [String], description: 'Phones', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  phones?: string[] | null;

  @ApiPropertyOptional({ type: [String], description: 'Emails', nullable: true })
  @IsOptional()
  @IsString({ each: true })
  emails?: string[] | null;
}

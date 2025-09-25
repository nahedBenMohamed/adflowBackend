import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { PermissionLevel } from '../../common';

export class ObjectPermissionDto {
  @ApiProperty({ description: 'The type of the object' })
  @IsString()
  objectType: string;

  @ApiProperty({ nullable: true, description: 'The ID of the object' })
  @IsOptional()
  @IsNumber()
  objectId: number | null;

  @ApiProperty({ enum: PermissionLevel, description: 'The create permission level for the object' })
  @IsEnum(PermissionLevel)
  createPermission: PermissionLevel;

  @ApiProperty({ enum: PermissionLevel, description: 'The view permission level for the object' })
  @IsEnum(PermissionLevel)
  viewPermission: PermissionLevel;

  @ApiProperty({ enum: PermissionLevel, description: 'The edit permission level for the object' })
  @IsEnum(PermissionLevel)
  editPermission: PermissionLevel;

  @ApiProperty({ enum: PermissionLevel, description: 'The delete permission level for the object' })
  @IsEnum(PermissionLevel)
  deletePermission: PermissionLevel;

  @ApiPropertyOptional({ enum: PermissionLevel, description: 'The report view permission level for the object' })
  @IsOptional()
  @IsEnum(PermissionLevel)
  reportPermission?: PermissionLevel;

  @ApiPropertyOptional({ enum: PermissionLevel, description: 'The dashboard view permission level for the object' })
  @IsOptional()
  @IsEnum(PermissionLevel)
  dashboardPermission?: PermissionLevel;
}

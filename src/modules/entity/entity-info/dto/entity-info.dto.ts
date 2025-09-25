import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class EntityInfoDto {
  @ApiProperty({ description: 'Entity ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Entity name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiProperty({ description: 'Owner (Responsible) User ID' })
  @IsNumber()
  ownerId: number;

  @ApiProperty({ description: 'Board ID', nullable: true })
  @IsOptional()
  @IsNumber()
  boardId: number | null;

  @ApiProperty({ description: 'Stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  stageId: number | null;

  @ApiProperty({ description: 'Date and time when the entity was created' })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ nullable: true, description: 'Date and time when the entity was closed' })
  @IsOptional()
  @IsString()
  closedAt?: string | null;

  @ApiPropertyOptional({ description: 'Entity ID from which the entity was copied', nullable: true })
  @IsOptional()
  @IsNumber()
  copiedFrom?: number | null;

  @ApiPropertyOptional({ description: 'Number of times the entity has been copied', nullable: true })
  @IsOptional()
  @IsNumber()
  copiedCount?: number | null;

  @ApiPropertyOptional({ description: 'Array of participant IDs', nullable: true, type: [Number] })
  @IsOptional()
  @IsNumber({}, { each: true })
  participantIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Whether the user has access to the entity', nullable: true })
  @IsOptional()
  @IsBoolean()
  hasAccess?: boolean | null;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused?: boolean;
}

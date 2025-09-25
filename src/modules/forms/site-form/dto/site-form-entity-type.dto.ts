import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class SiteFormEntityTypeDto {
  @ApiProperty({ description: 'Entity type ID' })
  @IsNumber()
  entityTypeId: number;

  @ApiProperty({ nullable: true, description: 'Board ID' })
  @IsOptional()
  @IsNumber()
  boardId: number | null;

  @ApiProperty({ description: 'Is main entity type' })
  @IsBoolean()
  isMain: boolean;
}

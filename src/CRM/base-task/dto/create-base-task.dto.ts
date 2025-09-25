import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export abstract class CreateBaseTaskDto {
  @ApiProperty({ description: 'Responsible user ID' })
  @IsNumber()
  responsibleUserId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Start date' })
  @IsOptional()
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'End date' })
  @IsOptional()
  @IsString()
  endDate?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Text' })
  @IsOptional()
  @IsString()
  text?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Is resolved' })
  @IsOptional()
  @IsBoolean()
  isResolved?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'Resolved date' })
  @IsOptional()
  @IsString()
  resolvedDate?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Weight' })
  @IsOptional()
  @IsNumber()
  weight?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Task ID to place after on weight' })
  @IsOptional()
  @IsNumber()
  afterId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Task ID to place before on weight' })
  @IsOptional()
  @IsNumber()
  beforeId?: number | null;
}

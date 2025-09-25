import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class MailboxEntitySettingsDto {
  @ApiPropertyOptional({ description: 'Contact entity type ID', nullable: true })
  @IsOptional()
  @IsNumber()
  contactEntityTypeId?: number | null;

  @ApiPropertyOptional({ description: 'Lead entity type ID', nullable: true })
  @IsOptional()
  @IsNumber()
  leadEntityTypeId?: number | null;

  @ApiPropertyOptional({ description: 'Lead board ID', nullable: true })
  @IsOptional()
  @IsNumber()
  leadBoardId?: number | null;

  @ApiPropertyOptional({ description: 'Lead stage ID', nullable: true })
  @IsOptional()
  @IsNumber()
  leadStageId?: number | null;

  @ApiPropertyOptional({ description: 'Lead name', nullable: true })
  @IsOptional()
  @IsString()
  leadName: string | null;

  @ApiPropertyOptional({ description: 'Lead and Contact responsible user ID', nullable: true })
  @IsOptional()
  @IsNumber()
  ownerId?: number | null;

  @ApiPropertyOptional({ description: 'Do not create lead if active lead exists', nullable: true })
  @IsOptional()
  @IsBoolean()
  checkActiveLead?: boolean;

  @ApiPropertyOptional({ description: 'Do not create duplicate contact', nullable: true })
  @IsOptional()
  @IsBoolean()
  checkDuplicate?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ScenarioType } from '../enums';

export class VoximplantScenarioEntityDto {
  @ApiProperty({ enum: ScenarioType })
  @IsEnum(ScenarioType)
  scenarioType: ScenarioType;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  contactId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  dealId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  ownerId: number | null;

  constructor(
    scenarioType: ScenarioType,
    contactId: number | null,
    dealId: number | null,
    boardId: number | null,
    ownerId: number | null,
  ) {
    this.scenarioType = scenarioType;
    this.contactId = contactId;
    this.dealId = dealId;
    this.boardId = boardId;
    this.ownerId = ownerId;
  }
}

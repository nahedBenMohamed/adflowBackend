import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ActionsSettings {
  @ApiProperty({ description: 'Allow any stage', nullable: true })
  @IsOptional()
  @IsBoolean()
  allowAnyStage?: boolean | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';

export class ActionChatSendAmworkSettings extends ActionsSettings {
  @ApiProperty({ description: 'Chat message text' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Send message from User ID', nullable: true })
  @IsOptional()
  @IsNumber()
  userId: number | null;

  @ApiProperty({ description: 'Send message to User ID', type: [Number], nullable: true })
  @IsOptional()
  @IsNumber({}, { each: true })
  sendTo: number[] | null;
}

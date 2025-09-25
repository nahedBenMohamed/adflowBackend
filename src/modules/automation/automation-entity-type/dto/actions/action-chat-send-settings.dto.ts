import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ActionsSettings } from '../../../common';
import { ActionSendOptions } from './action-send-options.dto';

export class ActionChatSendSettings extends ActionsSettings {
  @ApiProperty({ description: 'Chat message text' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Chat provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'Send message from User ID', nullable: true })
  @IsOptional()
  @IsNumber()
  userId: number | null;

  @ApiPropertyOptional({ description: 'Message send options', nullable: true, type: ActionSendOptions })
  @IsOptional()
  options?: ActionSendOptions | null;

  @ApiPropertyOptional({ description: 'Phone numbers', nullable: true, type: [String] })
  @IsOptional()
  @IsString({ each: true })
  phoneNumbers?: string[] | null;
}

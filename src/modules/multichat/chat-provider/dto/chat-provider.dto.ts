import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ChatProviderType, ChatProviderStatus, ChatProviderTransport } from '../../common';
import { ChatProviderEntitySettingsDto } from './chat-provider-entity-settings.dto';

export class ChatProviderDto {
  @ApiProperty({ description: 'Chat provider ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Chat provider type', enum: ChatProviderType })
  @IsEnum(ChatProviderType)
  type: ChatProviderType;

  @ApiProperty({ description: 'Chat provider transport', enum: ChatProviderTransport })
  @IsEnum(ChatProviderTransport)
  transport: ChatProviderTransport;

  @ApiProperty({ description: 'Chat provider title', nullable: true })
  @IsOptional()
  @IsString()
  title: string | null;

  @ApiProperty({ description: 'Chat provider status', enum: ChatProviderStatus })
  @IsEnum(ChatProviderStatus)
  status: ChatProviderStatus;

  @ApiProperty({ description: 'Messages per day for automated sending' })
  @IsNumber()
  messagePerDay: number;

  @ApiPropertyOptional({ description: 'Accessible user IDs', type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  accessibleUserIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Responsible user IDs', type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  responsibleUserIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Supervisor user IDs', type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  supervisorUserIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Unseen message count', nullable: true })
  @IsOptional()
  @IsNumber()
  unseenCount?: number | null;

  @ApiPropertyOptional({ description: 'Entity settings', nullable: true })
  @IsOptional()
  entitySettings?: ChatProviderEntitySettingsDto | null;
}

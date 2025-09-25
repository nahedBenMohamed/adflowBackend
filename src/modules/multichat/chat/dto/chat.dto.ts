import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { ChatType } from '../../common';
import { ChatMessageDto } from '../../chat-message/dto/chat-message.dto';
import { ChatUserDto } from '../../chat-user';

export class ChatDto {
  @ApiProperty({ description: 'Chat ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Chat provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'User ID who created the chat' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'External ID of the chat', nullable: true })
  @IsOptional()
  @IsString()
  externalId: string | null;

  @ApiProperty({ description: 'Type of the chat', enum: ChatType })
  @IsEnum(ChatType)
  type: ChatType;

  @ApiProperty({ description: 'Title of the chat', nullable: true })
  @IsOptional()
  @IsString()
  title: string | null;

  @ApiProperty({ description: 'Entity ID associated with the chat', nullable: true })
  @IsOptional()
  @IsNumber()
  entityId: number | null;

  @ApiProperty({ description: 'Date and time when the chat was created' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'Users in the chat', type: [ChatUserDto] })
  @IsArray()
  users: ChatUserDto[];

  @ApiProperty({ description: 'Pinned messages in the chat', type: [ChatMessageDto] })
  @IsArray()
  pinnedMessages: ChatMessageDto[];

  @ApiProperty({ description: 'Last message in the chat', type: [ChatMessageDto], nullable: true })
  lastMessage: ChatMessageDto | null;

  @ApiProperty({ description: 'Number of unseen messages in the chat for requested user' })
  @IsNumber()
  unseenCount: number;

  @ApiProperty({ description: 'Date and time when the chat was last updated' })
  @IsString()
  updatedAt: string;

  @ApiProperty({ description: 'Entity information associated with the chat', type: EntityInfoDto, nullable: true })
  @IsOptional()
  entityInfo: EntityInfoDto | null;

  @ApiPropertyOptional({ description: 'Whether the user has access to the chat', nullable: true })
  @IsOptional()
  @IsBoolean()
  hasAccess?: boolean | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { ChatMessageFileDto } from './chat-message-file.dto';
import { ChatMessageReactionDto } from './chat-message-reaction.dto';
import { ChatMessageUserStatusDto } from './chat-message-user-status.dto';

export class ChatMessageDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  chatId: number;

  @ApiProperty()
  @IsNumber()
  chatUserId: number;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ type: [ChatMessageUserStatusDto] })
  @IsArray()
  statuses: ChatMessageUserStatusDto[];

  @ApiProperty({ type: [ChatMessageFileDto] })
  @IsArray()
  files: ChatMessageFileDto[];

  @ApiProperty({ type: ChatMessageDto, nullable: true })
  @IsOptional()
  @IsObject()
  replyTo: ChatMessageDto | null;

  @ApiProperty({ type: [ChatMessageReactionDto] })
  @IsArray()
  reactions: ChatMessageReactionDto[];

  @ApiProperty()
  @IsString()
  createdAt: string;

  constructor(
    id: number,
    chatId: number,
    chatUserId: number,
    text: string,
    statuses: ChatMessageUserStatusDto[],
    files: ChatMessageFileDto[],
    replyTo: ChatMessageDto | null,
    reactions: ChatMessageReactionDto[],
    createdAt: string,
  ) {
    this.id = id;
    this.chatId = chatId;
    this.chatUserId = chatUserId;
    this.text = text;
    this.statuses = statuses;
    this.files = files;
    this.replyTo = replyTo;
    this.reactions = reactions;
    this.createdAt = createdAt;
  }
}

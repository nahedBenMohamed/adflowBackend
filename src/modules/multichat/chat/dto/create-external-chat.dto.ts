import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { ChatUserExternalDto } from '../../chat-user';

export class CreateExternalChatDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'Chat title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'User IDs of chat participants', type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  participantIds?: number[] | null;

  @ApiPropertyOptional({ description: 'Entity ID associated with the chat', nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional({ description: 'External ID of the chat', nullable: true })
  @IsOptional()
  @IsString()
  externalId?: string | null;

  @ApiPropertyOptional({ description: 'External user data', type: ChatUserExternalDto })
  @IsOptional()
  externalUser?: ChatUserExternalDto;
}

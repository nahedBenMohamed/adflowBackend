import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGroupChatDto {
  @ApiPropertyOptional({ description: 'Chat title', nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ description: 'Entity ID associated with the chat', nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiProperty({ description: 'User IDs of chat participants', type: [Number] })
  @IsOptional()
  @IsArray()
  participantIds?: number[];
}

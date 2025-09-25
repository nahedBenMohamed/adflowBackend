import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupChatDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'Chat title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'User IDs of chat participants', type: [Number] })
  @IsArray()
  participantIds: number[];

  @ApiPropertyOptional({ description: 'Entity ID associated with the chat', nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ChatMessageReactionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  chatUserId: number;

  @ApiProperty()
  @IsString()
  reaction: string;

  constructor(id: number, chatUserId: number, reaction: string) {
    this.id = id;
    this.chatUserId = chatUserId;
    this.reaction = reaction;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreatePersonalChatDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'User ID of chat companion' })
  @IsNumber()
  companionId: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatFindByMessageContentFilterDto {
  @ApiProperty({ description: 'Content to find messages with matching text', required: true })
  @IsString()
  messageContent: string;

  @ApiPropertyOptional({ description: 'Provider ID to filter messages', nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  providerId?: number | null;
}

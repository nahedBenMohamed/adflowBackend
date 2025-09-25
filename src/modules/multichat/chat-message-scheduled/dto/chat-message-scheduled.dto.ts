import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatMessageScheduledDto {
  @ApiProperty({ description: 'Scheduled message ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'User ID who sent the message' })
  @IsNumber()
  sendFrom: number;

  @ApiProperty({ description: 'Date and time when the message was created' })
  @IsString()
  createdAt: string;

  @ApiProperty({ description: 'Chat Provider ID' })
  @IsNumber()
  providerId: number;

  @ApiProperty({ description: 'Message text' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ nullable: true, description: 'Entity ID associated with the message' })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Phone number associated with the message' })
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiProperty({ description: 'Send only to first chat' })
  @IsBoolean()
  onlyFirst: boolean;

  @ApiPropertyOptional({ description: 'Date and time when the message was sent', nullable: true })
  @IsOptional()
  @IsNumber()
  sentAt?: string | null;
}

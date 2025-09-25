import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChatProviderTransport } from '../../common';

export class ChatFindFilterDto {
  @ApiPropertyOptional({ description: 'Chat ID', nullable: true })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional({ description: 'Phone number if external user in chat', nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string | null;

  @ApiPropertyOptional({ description: 'Chat provider transport', enum: ChatProviderTransport, nullable: true })
  @IsOptional()
  @IsEnum(ChatProviderTransport)
  transport?: ChatProviderTransport | null;

  @ApiPropertyOptional({ description: 'Chat title', nullable: true })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ description: 'Provider ID', nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  providerId?: number;
}

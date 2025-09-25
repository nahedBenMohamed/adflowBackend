import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatFindPersonalFilterDto {
  @ApiProperty({ description: 'Full name of user with whom personal chat was created', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Provider ID', nullable: true, required: false })
  @IsOptional()
  @IsNumber()
  providerId?: number | null;
}

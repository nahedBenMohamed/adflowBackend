import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CheckDocumentDto {
  @ApiProperty()
  @IsNumber()
  entityId: number;

  @ApiProperty()
  @IsNumber()
  templateId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  orderId?: number | null;
}

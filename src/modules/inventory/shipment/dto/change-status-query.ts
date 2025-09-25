import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ChangeStatusQuery {
  @ApiPropertyOptional({ description: 'Return stocks to warehouse' })
  @IsOptional()
  @IsBoolean()
  returnStocks?: boolean;
}

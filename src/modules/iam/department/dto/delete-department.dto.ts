import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class DeleteDepartmentDto {
  @ApiPropertyOptional({ description: 'New department ID to reassign employees to' })
  @IsOptional()
  @IsNumber()
  newDepartmentId?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FioDto {
  @ApiPropertyOptional({ description: 'Name', nullable: true })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiPropertyOptional({ description: 'Surname', nullable: true })
  @IsOptional()
  @IsString()
  surname?: string | null;

  @ApiPropertyOptional({ description: 'Patronymic name', nullable: true })
  @IsOptional()
  @IsString()
  patronymic?: string | null;
}

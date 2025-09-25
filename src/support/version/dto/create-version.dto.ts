import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVersionDto {
  @ApiProperty({ description: 'Version number, should be in the format of x.x.x, where x is a number' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional()
  @IsOptional()
  code: string;
}

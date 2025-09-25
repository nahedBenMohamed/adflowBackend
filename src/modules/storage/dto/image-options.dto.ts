import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class ImageOptionsDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  height?: number;
}

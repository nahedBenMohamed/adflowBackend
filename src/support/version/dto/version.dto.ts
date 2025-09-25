import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VersionDto {
  @ApiProperty({ description: 'Version ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Version number in x.x.x format, where x is a number' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Version creation date in ISO format' })
  @IsString()
  date: string;
}

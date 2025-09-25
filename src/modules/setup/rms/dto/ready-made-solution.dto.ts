import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReadyMadeSolutionDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';

import { IndustryCode } from '../../common/enums/industry-code.enum';
import { Industry } from '../entities/industry.entity';
import { ReadyMadeSolutionDto } from './ready-made-solution.dto';

export class IndustryDto {
  @ApiProperty({ enum: IndustryCode })
  @IsEnum(IndustryCode)
  code: IndustryCode;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty({ type: [ReadyMadeSolutionDto] })
  @IsArray()
  readyMadeSolutions: ReadyMadeSolutionDto[];

  constructor(code: IndustryCode, name: string, color: string, readyMadeSolutions: ReadyMadeSolutionDto[]) {
    this.code = code;
    this.name = name;
    this.color = color;
    this.readyMadeSolutions = readyMadeSolutions;
  }

  public static fromModel(model: Industry, readyMadeSolutions: ReadyMadeSolutionDto[]) {
    return new IndustryDto(model.code, model.name, model.color, readyMadeSolutions);
  }
}

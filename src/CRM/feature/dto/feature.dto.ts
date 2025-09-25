import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class FeatureDto {
  @ApiProperty({ description: 'Feature ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Feature name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Feature code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Is feature enabled' })
  @IsBoolean()
  isEnabled: boolean;

  constructor(id: number, name: string, code: string, isEnabled: boolean) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.isEnabled = isEnabled;
  }
}

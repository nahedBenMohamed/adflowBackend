import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class TaskSubtaskDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsBoolean()
  resolved: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  constructor({ id, text, resolved, sortOrder }: TaskSubtaskDto) {
    this.id = id;
    this.text = text;
    this.resolved = resolved;
    this.sortOrder = sortOrder;
  }
}

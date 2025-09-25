import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FieldOptionDto {
  @ApiProperty({ description: 'Field option ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Field option label' })
  @IsNumber()
  label: string;

  @ApiProperty({ nullable: true, description: 'Field option color' })
  @IsOptional()
  @IsString()
  color: string | null;

  @ApiProperty({ description: 'Field option sort order' })
  @IsNumber()
  sortOrder: number;

  @ApiProperty({ description: 'Field ID' })
  @IsNumber()
  fieldId: number;

  constructor({ id, label, color, sortOrder }: FieldOptionDto) {
    this.id = id;
    this.label = label;
    this.color = color;
    this.sortOrder = sortOrder;
  }
}

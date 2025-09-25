import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductCategoryDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  parentId: number | null;

  @ApiProperty({ type: [ProductCategoryDto] })
  @IsArray()
  children: ProductCategoryDto[];

  constructor(id: number, sectionId: number, name: string, parentId: number | null, children: ProductCategoryDto[]) {
    this.id = id;
    this.sectionId = sectionId;
    this.name = name;
    this.parentId = parentId;
    this.children = children;
  }
}

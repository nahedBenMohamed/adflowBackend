import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { ProductsSectionType } from '../enums/products-section-type.enum';

export class ProductsSectionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  icon: string;

  @ApiPropertyOptional({ nullable: true, enum: ProductsSectionType })
  @IsOptional()
  @IsEnum(ProductsSectionType)
  type: ProductsSectionType | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableWarehouse?: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableBarcode?: boolean | null;

  @ApiPropertyOptional({ nullable: true, description: 'in hours' })
  @IsOptional()
  @IsNumber()
  cancelAfter?: number | null;

  @ApiProperty({ type: [Number] })
  @IsArray()
  entityTypeIds: number[];

  @ApiProperty({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  schedulerIds: number[] | null;

  constructor({
    id,
    name,
    icon,
    type,
    enableWarehouse,
    enableBarcode,
    cancelAfter,
    entityTypeIds,
    schedulerIds,
  }: ProductsSectionDto) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.enableWarehouse = enableWarehouse;
    this.enableBarcode = enableBarcode;
    this.cancelAfter = cancelAfter;
    this.entityTypeIds = entityTypeIds;
    this.schedulerIds = schedulerIds;
  }
}

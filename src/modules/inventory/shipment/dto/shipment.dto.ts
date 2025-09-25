import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto';

import { ShipmentItemDto } from './shipment-item.dto';

export class ShipmentDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty()
  @IsNumber()
  warehouseId: number;

  @ApiProperty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsNumber()
  orderNumber: number;

  @ApiProperty()
  @IsNumber()
  statusId: number;

  @ApiProperty({ type: EntityInfoDto })
  @IsNotEmpty()
  entityInfo: EntityInfoDto;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  shippedAt: string | null;

  @ApiProperty({ type: [ShipmentItemDto] })
  @IsArray()
  items: ShipmentItemDto[];
}

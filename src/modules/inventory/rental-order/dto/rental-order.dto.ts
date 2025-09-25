import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { Currency, DatePeriodDto } from '@/common';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { RentalOrderStatus } from '../enums';
import { RentalOrderItemDto } from './rental-order-item.dto';

export class RentalOrderDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  sectionId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  warehouseId: number | null;

  @ApiProperty()
  @IsNumber()
  orderNumber: number;

  @ApiProperty()
  @IsNumber()
  createdBy: number;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  @IsBoolean()
  taxIncluded: boolean;

  @ApiProperty({ enum: RentalOrderStatus })
  @IsEnum(RentalOrderStatus)
  status: RentalOrderStatus;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty({ type: [DatePeriodDto] })
  @IsArray()
  periods: DatePeriodDto[];

  @ApiProperty({ type: [RentalOrderItemDto] })
  @IsArray()
  items: RentalOrderItemDto[];

  @ApiProperty({ type: EntityInfoDto })
  @IsNotEmpty()
  entityInfo: EntityInfoDto;

  constructor(
    id: number,
    sectionId: number,
    warehouseId: number | null,
    orderNumber: number,
    createdBy: number,
    currency: Currency,
    taxIncluded: boolean,
    status: RentalOrderStatus,
    createdAt: string,
    periods: DatePeriodDto[],
    items: RentalOrderItemDto[],
    entityInfo: EntityInfoDto,
  ) {
    this.id = id;
    this.sectionId = sectionId;
    this.warehouseId = warehouseId;
    this.orderNumber = orderNumber;
    this.createdBy = createdBy;
    this.currency = currency;
    this.taxIncluded = taxIncluded;
    this.status = status;
    this.createdAt = createdAt;
    this.periods = periods;
    this.items = items;
    this.entityInfo = entityInfo;
  }
}

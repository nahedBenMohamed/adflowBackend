import { ApiProperty } from '@nestjs/swagger';

import { QuantityAmountDto } from '@/common';
import { InventoryReportUserCellDto } from './inventory-report-user-cell.dto';

export class InventoryReportRowDto {
  @ApiProperty()
  ownerId: number;

  @ApiProperty({ nullable: true })
  categoryId: number | null;

  @ApiProperty({ nullable: true })
  productName: string | null;

  @ApiProperty({ type: QuantityAmountDto })
  sold: QuantityAmountDto;

  @ApiProperty({ type: QuantityAmountDto, nullable: true })
  shipped: QuantityAmountDto | null;

  @ApiProperty({ type: QuantityAmountDto, nullable: true })
  open: QuantityAmountDto | null;

  @ApiProperty({ type: QuantityAmountDto, nullable: true })
  lost: QuantityAmountDto | null;

  @ApiProperty({ type: QuantityAmountDto, nullable: true })
  all: QuantityAmountDto | null;

  @ApiProperty({ nullable: true })
  avgProducts: number | null;

  @ApiProperty({ nullable: true })
  avgBudget: number | null;

  @ApiProperty({ nullable: true })
  avgTerm: number | null;

  @ApiProperty({ type: [InventoryReportUserCellDto], nullable: true })
  users: InventoryReportUserCellDto[] | null;

  constructor({
    ownerId,
    categoryId,
    productName,
    sold,
    shipped,
    open,
    lost,
    all,
    avgProducts,
    avgBudget,
    avgTerm,
    users,
  }: InventoryReportRowDto) {
    this.ownerId = ownerId;
    this.categoryId = categoryId;
    this.productName = productName;
    this.sold = sold;
    this.shipped = shipped;
    this.open = open;
    this.lost = lost;
    this.all = all;
    this.avgProducts = avgProducts;
    this.avgBudget = avgBudget;
    this.avgTerm = avgTerm;
    this.users = users;
  }
}

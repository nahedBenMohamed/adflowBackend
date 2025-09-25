import { type QuantityAmount } from '@/common';
import { InventoryReportUserCellDto } from '../dto';

export class InventoryReportUserCell {
  userId: number;
  value: QuantityAmount;

  constructor(userId: number, value: QuantityAmount) {
    this.userId = userId;
    this.value = value;
  }

  public toDto(): InventoryReportUserCellDto {
    return new InventoryReportUserCellDto({ userId: this.userId, value: this.value.toDto() });
  }

  public add(cell: InventoryReportUserCell) {
    this.value.add(cell.value);
  }
}

import { type QuantityAmount } from '@/common';
import { InventoryReportRowDto } from '../dto';
import { InventoryReportUserCell } from './inventory-report-user-cell';

export class InventoryReportRow {
  ownerId: number;
  categoryId: number | null;
  productName: string | null;
  sold?: QuantityAmount;
  shipped?: QuantityAmount;
  open?: QuantityAmount;
  lost?: QuantityAmount;
  all?: QuantityAmount;
  avgProducts?: number;
  avgBudget?: number;
  avgTerm?: number;
  users?: Map<number, InventoryReportUserCell>;

  constructor(
    ownerId: number,
    categoryId: number | null,
    values?: {
      productName: string | null;
      sold?: QuantityAmount;
      shipped?: QuantityAmount;
      open?: QuantityAmount;
      lost?: QuantityAmount;
      all?: QuantityAmount;
      avgProducts?: number;
      avgBudget?: number;
      avgTerm?: number;
      users?: Map<number, InventoryReportUserCell>;
    },
  ) {
    this.ownerId = ownerId;
    this.categoryId = categoryId;
    this.productName = values?.productName;
    this.sold = values?.sold;
    this.shipped = values?.shipped;
    this.open = values?.open;
    this.lost = values?.lost;
    this.all = values?.all;
    this.avgProducts = values?.avgProducts;
    this.avgBudget = values?.avgBudget;
    this.avgTerm = values?.avgTerm;
    this.users = values?.users;
  }

  public static empty(ownerId: number, categoryId: number | null): InventoryReportRow {
    return new InventoryReportRow(ownerId, categoryId);
  }

  public toDto(): InventoryReportRowDto {
    return new InventoryReportRowDto({
      ownerId: this.ownerId,
      categoryId: this.categoryId,
      productName: this.productName,
      sold: this.sold?.toDto(),
      shipped: this.shipped?.toDto(),
      open: this.open?.toDto(),
      lost: this.lost?.toDto(),
      all: this.all?.toDto(),
      avgProducts: this.avgProducts,
      avgBudget: this.avgBudget,
      avgTerm: this.avgTerm,
      users: this.users?.size ? Array.from(this.users.values()).map((v) => v.toDto()) : undefined,
    });
  }

  public addUser(ownerId: number, value: QuantityAmount) {
    if (!this.users) {
      this.users = new Map<number, InventoryReportUserCell>();
    }
    this.users.set(ownerId, new InventoryReportUserCell(ownerId, value));
  }

  public add(row: InventoryReportRow): InventoryReportRow {
    if (this.sold) {
      this.sold.add(row.sold);
    } else {
      this.sold = row.sold;
    }
    if (this.shipped) {
      this.shipped.add(row.shipped);
    } else {
      this.shipped = row.shipped;
    }
    if (this.open) {
      this.open.add(row.open);
    } else {
      this.open = row.open;
    }
    if (this.lost) {
      this.lost.add(row.lost);
    } else {
      this.lost = row.lost;
    }
    if (this.all) {
      this.all.add(row.all);
    } else {
      this.all = row.all;
    }
    if (this.avgProducts) {
      this.avgProducts += row.avgProducts ?? 0;
    } else {
      this.avgProducts = row.avgProducts;
    }
    if (this.avgBudget) {
      this.avgBudget += row.avgBudget ?? 0;
    } else {
      this.avgBudget = row.avgBudget;
    }
    if (this.avgTerm) {
      this.avgTerm += row.avgTerm ?? 0;
    } else {
      this.avgTerm = row.avgTerm;
    }
    if (this.users) {
      for (const [userId, userCell] of row.users) {
        if (this.users.has(userId)) {
          this.users.get(userId).add(userCell);
        } else {
          this.users.set(userId, userCell);
        }
      }
    } else if (row.users) {
      this.users = new Map<number, InventoryReportUserCell>();
      for (const [userId, userCell] of row.users) {
        this.users.set(userId, userCell);
      }
    }

    return this;
  }
}

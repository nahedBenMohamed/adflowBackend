import { InventoryReportDto } from '../dto';
import { InventoryReportRow } from './inventory-report-row';

export class InventoryReport {
  products: Map<number, InventoryReportRow> | null | undefined;
  categories: Map<number, InventoryReportRow> | null | undefined;
  total: InventoryReportRow | null | undefined;

  constructor(
    products: Map<number, InventoryReportRow> | null | undefined,
    categories: Map<number, InventoryReportRow> | null | undefined,
    total: InventoryReportRow | null | undefined,
  ) {
    this.products = products;
    this.categories = categories;
    this.total = total;
  }

  public static createEmptyRow(ownerId: number, categoryId: number | null): InventoryReportRow {
    return InventoryReportRow.empty(ownerId, categoryId);
  }

  public toDto(): InventoryReportDto {
    return new InventoryReportDto({
      products: this.products ? Array.from(this.products.values()).map((u) => u.toDto()) : undefined,
      categories: this.categories ? Array.from(this.categories.values()).map((u) => u.toDto()) : undefined,
      total: this.total ? this.total.toDto() : undefined,
    });
  }
}

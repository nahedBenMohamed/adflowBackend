import { ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryReportRowDto } from './inventory-report-row.dto';

export class InventoryReportDto {
  @ApiPropertyOptional({ type: [InventoryReportRowDto], nullable: true })
  products: InventoryReportRowDto[] | null | undefined;
  @ApiPropertyOptional({ type: [InventoryReportRowDto], nullable: true })
  categories: InventoryReportRowDto[] | null | undefined;
  @ApiPropertyOptional({ type: InventoryReportRowDto, nullable: true })
  total: InventoryReportRowDto | null | undefined;

  constructor({ products, categories, total }: InventoryReportDto) {
    this.products = products;
    this.categories = categories;
    this.total = total;
  }
}

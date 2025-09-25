import { ProductRentalStatusDto } from '../dto';
import { type RentalEvent } from '../entities';
import { type RentalScheduleStatus } from '../enums';

export class ProductRentalStatus {
  productId: number;
  status: RentalScheduleStatus;
  events: RentalEvent[];

  constructor(productId: number, status: RentalScheduleStatus, events: RentalEvent[]) {
    this.productId = productId;
    this.status = status;
    this.events = events;
  }

  public toDto(): ProductRentalStatusDto {
    return new ProductRentalStatusDto(
      this.productId,
      this.status,
      this.events.map((e) => e.toDto()),
    );
  }
}

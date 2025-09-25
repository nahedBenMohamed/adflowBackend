import { type Product } from '../../product/entities/product.entity';

import { RentalScheduleDto } from '../dto';
import { type RentalEvent } from '../entities';

export class RentalSchedule {
  products: Product[];

  events: RentalEvent[];

  constructor(products: Product[], events: RentalEvent[]) {
    this.products = products;
    this.events = events;
  }

  public toDto(): RentalScheduleDto {
    return new RentalScheduleDto(
      this.products.map((p) => p.toInfo()),
      this.events.map((e) => e.toDto()),
    );
  }
}

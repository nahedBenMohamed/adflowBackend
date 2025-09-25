import { QuantityAmountDto } from '../dto';

export class QuantityAmount {
  quantity: number;
  amount: number;

  constructor(quantity: number, amount: number) {
    this.quantity = quantity;
    this.amount = amount;
  }

  public static empty(): QuantityAmount {
    return new QuantityAmount(0, 0);
  }

  public toDto(): QuantityAmountDto {
    return new QuantityAmountDto(this.quantity, this.amount);
  }

  public add(value?: QuantityAmount): QuantityAmount {
    this.quantity += value?.quantity ?? 0;
    this.amount += value?.amount ?? 0;

    return this;
  }
}

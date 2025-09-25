import Decimal from 'decimal.js';

interface OrderItem {
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
}

export class OrderHelper {
  public static calcTotalAmount(items: OrderItem[], taxIncluded: boolean): number {
    let totalAmount = new Decimal(0);
    for (const item of items) {
      totalAmount = totalAmount.plus(this.calcAmount(item, taxIncluded));
    }
    return totalAmount.toNumber();
  }

  public static calcAmount(item: OrderItem, taxIncluded: boolean): number {
    const amount = new Decimal(item.unitPrice).mul(item.quantity);
    const discountTotal = amount.mul(new Decimal(item.discount).div(100));

    if (taxIncluded) {
      return amount.sub(discountTotal).toNumber();
    }

    const taxTotal = amount.mul(new Decimal(item.tax).div(100));
    return amount.add(taxTotal).sub(discountTotal).toNumber();
  }
}

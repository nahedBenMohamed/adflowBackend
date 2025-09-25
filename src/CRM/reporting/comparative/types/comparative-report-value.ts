import { QuantityAmount } from '@/common';

import { ComparativeReportValueDto } from '../dto/comparative-report-value.dto';

export class ComparativeReportValue {
  current: QuantityAmount;
  previous: QuantityAmount;
  difference: QuantityAmount;

  constructor(current: QuantityAmount, previous: QuantityAmount, difference: QuantityAmount) {
    this.current = current;
    this.previous = previous;
    this.difference = difference;
  }

  public static empty(): ComparativeReportValue {
    return new ComparativeReportValue(QuantityAmount.empty(), QuantityAmount.empty(), QuantityAmount.empty());
  }

  public toDto(): ComparativeReportValueDto {
    return { current: this.current.toDto(), previous: this.previous.toDto(), difference: this.difference.toDto() };
  }

  public add(cell: ComparativeReportValue): ComparativeReportValue {
    this.current.add(cell.current);
    this.previous.add(cell.previous);
    this.difference.add(cell.difference);

    return this;
  }
}

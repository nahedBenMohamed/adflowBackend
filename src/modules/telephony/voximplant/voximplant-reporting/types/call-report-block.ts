import { QuantityAmount } from '@/common';
import { CallReportBlockDto } from '../dto';

export class CallReportBlock {
  all: QuantityAmount;
  incoming: QuantityAmount;
  outgoing: QuantityAmount;
  missed: QuantityAmount;
  avgAll: QuantityAmount;
  avgIncoming: QuantityAmount;
  avgOutgoing: QuantityAmount;

  constructor(
    all: QuantityAmount,
    incoming: QuantityAmount,
    outgoing: QuantityAmount,
    missed: QuantityAmount,
    avgAll: QuantityAmount,
    avgIncoming: QuantityAmount,
    avgOutgoing: QuantityAmount,
  ) {
    this.all = all;
    this.incoming = incoming;
    this.outgoing = outgoing;
    this.missed = missed;
    this.avgAll = avgAll;
    this.avgIncoming = avgIncoming;
    this.avgOutgoing = avgOutgoing;
  }

  public static empty(): CallReportBlock {
    return new CallReportBlock(
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
    );
  }

  public toDto(): CallReportBlockDto {
    return {
      all: this.all.toDto(),
      incoming: this.incoming.toDto(),
      outgoing: this.outgoing.toDto(),
      missed: this.missed.toDto(),
      avgAll: this.avgAll.toDto(),
      avgIncoming: this.avgIncoming.toDto(),
      avgOutgoing: this.avgOutgoing.toDto(),
    };
  }

  public add(cell: CallReportBlock): CallReportBlock {
    this.all.add(cell.all);
    this.incoming.add(cell.incoming);
    this.outgoing.add(cell.outgoing);
    this.missed.add(cell.missed);

    return this;
  }
}

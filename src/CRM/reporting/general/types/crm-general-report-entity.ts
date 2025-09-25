import { QuantityAmount } from '@/common';

import { CrmGeneralReportEntityDto } from '../dto/crm-general-report-entity.dto';

export class CrmGeneralReportEntity {
  useWon: boolean;
  all: QuantityAmount;
  open: QuantityAmount;
  lost: QuantityAmount;
  won: QuantityAmount;
  close: number;

  constructor(
    useWon: boolean,
    all: QuantityAmount,
    open: QuantityAmount,
    lost: QuantityAmount,
    won: QuantityAmount,
    close: number,
  ) {
    this.useWon = useWon;
    this.all = all;
    this.open = open;
    this.lost = lost;
    this.won = won;
    this.close = close;
  }

  public static empty(useWon: boolean): CrmGeneralReportEntity {
    return new CrmGeneralReportEntity(
      useWon,
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      0,
    );
  }

  public get avgAmount(): number {
    const avg = this.useWon ? this.won.amount / this.won.quantity : this.all.amount / this.all.quantity;

    return Number.isNaN(avg) ? 0 : avg;
  }

  public get avgClose(): number {
    const avg = this.useWon ? this.close / this.won.quantity : this.close / this.lost.quantity;

    return Number.isNaN(avg) ? 0 : avg;
  }

  public toDto(): CrmGeneralReportEntityDto {
    return new CrmGeneralReportEntityDto(
      this.all.toDto(),
      this.open.toDto(),
      this.lost.toDto(),
      this.won.toDto(),
      this.avgAmount,
      this.avgClose,
    );
  }

  public add(entity: CrmGeneralReportEntity) {
    this.all.add(entity.all);
    this.open.add(entity.open);
    this.won.add(entity.won);
    this.lost.add(entity.lost);
    this.close += entity.close;
  }
}

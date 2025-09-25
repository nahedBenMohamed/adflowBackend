import { QuantityAmount } from '@/common';

import { CustomerReportRowDto } from '../dto';
import { type CustomerReportField } from './customer-report-field';

export class CustomerReportRow {
  ownerId: number;
  ownerEntityTypeId: number;
  ownerName: string;
  wonProductQuantity: number;
  won: QuantityAmount;
  open: QuantityAmount;
  lost: QuantityAmount;
  all: QuantityAmount;
  avgWonDealQuantity: number;
  avgWonDealBudget: number;
  avgWonDealTime: number;
  fields: Map<number, CustomerReportField> | null;

  constructor(
    ownerId: number,
    ownerEntityTypeId: number,
    ownerName: string,
    wonProductQuantity: number,
    won: QuantityAmount,
    open: QuantityAmount,
    lost: QuantityAmount,
    all: QuantityAmount,
    avgWonDealQuantity: number,
    avgWonDealBudget: number,
    avgWonDealTime: number,
    fields: Map<number, CustomerReportField> | null,
  ) {
    this.ownerId = ownerId;
    this.ownerEntityTypeId = ownerEntityTypeId;
    this.ownerName = ownerName;
    this.wonProductQuantity = wonProductQuantity;
    this.won = won;
    this.open = open;
    this.lost = lost;
    this.all = all;
    this.avgWonDealQuantity = avgWonDealQuantity;
    this.avgWonDealBudget = avgWonDealBudget;
    this.avgWonDealTime = avgWonDealTime;
    this.fields = fields;
  }

  public static empty(ownerId: number, ownerEntityTypeId: number, ownerName: string): CustomerReportRow {
    return new CustomerReportRow(
      ownerId,
      ownerEntityTypeId,
      ownerName,
      0,
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      QuantityAmount.empty(),
      0,
      0,
      0,
      null,
    );
  }

  public toDto(): CustomerReportRowDto {
    return {
      ownerId: this.ownerId,
      ownerEntityTypeId: this.ownerEntityTypeId,
      ownerName: this.ownerName,
      wonProductQuantity: this.wonProductQuantity,
      won: this.won.toDto(),
      open: this.open.toDto(),
      lost: this.lost.toDto(),
      all: this.all.toDto(),
      avgWonDealQuantity: this.avgWonDealQuantity,
      avgWonDealBudget: this.avgWonDealBudget,
      avgWonDealTime: this.avgWonDealTime,
      fields: this.fields ? Array.from(this.fields.values()).map((v) => v.toDto()) : null,
    };
  }
}

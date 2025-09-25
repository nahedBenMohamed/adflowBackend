import { CallReportRowDto } from '../dto';
import { CallReportBlock } from './call-report-block';

export class CallReportRow {
  ownerId: number;
  call: CallReportBlock;

  constructor(ownerId: number, call: CallReportBlock) {
    this.ownerId = ownerId;
    this.call = call;
  }

  public static empty(ownerId: number): CallReportRow {
    return new CallReportRow(ownerId, CallReportBlock.empty());
  }

  public toDto(): CallReportRowDto {
    return { ownerId: this.ownerId, call: this.call.toDto() };
  }

  public add(row: CallReportRow): CallReportRow {
    this.call.add(row.call);

    return this;
  }
}

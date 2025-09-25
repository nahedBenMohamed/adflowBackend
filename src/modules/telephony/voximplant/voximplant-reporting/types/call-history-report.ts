import { PagingMeta } from '@/common';
import { VoximplantCall } from '../../voximplant-call';
import { CallHistoryReportDto } from '../dto';

export class CallHistoryReport {
  calls: VoximplantCall[];
  meta: PagingMeta;

  constructor({ calls, offset, total }: { calls: VoximplantCall[]; offset: number; total: number }) {
    this.calls = calls;
    this.meta = new PagingMeta(offset, total);
  }

  public toDto(): CallHistoryReportDto {
    return { calls: this.calls.map((call) => call.toDto()), meta: this.meta };
  }
}

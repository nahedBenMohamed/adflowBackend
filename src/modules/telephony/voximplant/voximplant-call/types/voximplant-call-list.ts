import { PagingMeta } from '@/common';

import { VoximplantCallListDto } from '../dto';
import { VoximplantCall } from '../entities';

export class VoximplantCallList {
  calls: VoximplantCall[];
  offset: number;
  total: number;

  constructor(calls: VoximplantCall[], offset: number, total: number) {
    this.calls = calls;
    this.offset = offset;
    this.total = total;
  }

  public toDto(): VoximplantCallListDto {
    return new VoximplantCallListDto(
      this.calls ? this.calls.map((c) => c.toDto()) : [],
      new PagingMeta(this.offset, this.total),
    );
  }
}

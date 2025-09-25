import { CurrentDiscountDto } from '../dto';

export class CurrentDiscount {
  percent: number;
  endAt: Date;
  code: string | null;

  constructor({ percent, endAt, code }: { percent: number; endAt: Date; code: string | null }) {
    this.percent = percent;
    this.endAt = endAt;
    this.code = code;
  }

  toDto(): CurrentDiscountDto {
    return {
      percent: this.percent,
      endAt: this.endAt.toISOString(),
      code: this.code,
    };
  }
}

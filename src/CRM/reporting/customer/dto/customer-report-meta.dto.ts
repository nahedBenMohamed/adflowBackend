import { ApiProperty } from '@nestjs/swagger';

import { PagingMeta } from '@/common';
import { CustomerReportFieldMetaDto } from './customer-report-field-meta.dto';

export class CustomerReportMetaDto extends PagingMeta {
  @ApiProperty({ type: [CustomerReportFieldMetaDto], description: 'Fields meta' })
  fields: CustomerReportFieldMetaDto[];

  constructor({ offset, total, fields }: CustomerReportMetaDto) {
    super(offset, total);

    this.fields = fields;
  }
}

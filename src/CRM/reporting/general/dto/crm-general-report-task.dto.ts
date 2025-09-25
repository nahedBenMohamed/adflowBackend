import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CrmGeneralReportTaskDto {
  @ApiProperty()
  @IsNumber()
  all: number;

  @ApiProperty()
  @IsNumber()
  open: number;

  @ApiProperty()
  @IsNumber()
  expired: number;

  @ApiProperty()
  @IsNumber()
  resolved: number;

  constructor(all: number, open: number, expired: number, resolved: number) {
    this.all = all;
    this.open = open;
    this.expired = expired;
    this.resolved = resolved;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { RentalScheduleStatus } from '../enums';

export class RentalEventDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  orderItemId: number;

  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiProperty()
  @IsString()
  endDate: string;

  @ApiProperty({ enum: RentalScheduleStatus })
  @IsEnum(RentalScheduleStatus)
  status: RentalScheduleStatus;

  @ApiProperty({ type: EntityInfoDto })
  @IsNotEmpty()
  entityInfo: EntityInfoDto;

  constructor(
    id: number,
    productId: number,
    orderItemId: number,
    startDate: string,
    endDate: string,
    status: RentalScheduleStatus,
    entityInfo: EntityInfoDto,
  ) {
    this.id = id;
    this.productId = productId;
    this.orderItemId = orderItemId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
    this.entityInfo = entityInfo;
  }
}

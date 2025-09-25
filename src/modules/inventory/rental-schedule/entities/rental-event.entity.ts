import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { RentalScheduleStatus } from '../enums';
import { RentalEventDto } from '../dto';

@Entity()
export class RentalEvent {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sectionId: number;

  @Column()
  productId: number;

  @Column()
  orderItemId: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  status: RentalScheduleStatus;

  @Column()
  accountId: number;

  private _entityInfo: EntityInfoDto;

  constructor(
    accountId: number,
    sectionId: number,
    productId: number,
    orderItemId: number,
    startDate: Date,
    endDate: Date,
    status: RentalScheduleStatus,
  ) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.productId = productId;
    this.orderItemId = orderItemId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  public get entityInfo(): EntityInfoDto {
    return this._entityInfo;
  }
  public set entityInfo(entityInfo: EntityInfoDto) {
    this._entityInfo = entityInfo;
  }

  public toDto(): RentalEventDto {
    return new RentalEventDto(
      this.id,
      this.productId,
      this.orderItemId,
      this.startDate.toISOString(),
      this.endDate.toISOString(),
      this.status,
      this._entityInfo,
    );
  }

  public ensureDates(notEarlier: Date, notLater: Date): RentalEvent {
    if (this.startDate < notEarlier) {
      this.startDate = notEarlier;
    }
    if (this.endDate > notLater) {
      this.endDate = notLater;
    }

    return this;
  }
}

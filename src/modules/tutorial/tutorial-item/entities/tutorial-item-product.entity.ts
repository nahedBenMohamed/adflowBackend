import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { TutorialProductType } from '../../common';
import { TutorialItemProductDto } from '../dto';

@Entity()
export class TutorialItemProduct {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  itemId: number;

  @Column()
  type: TutorialProductType;

  @Column({ nullable: true })
  objectId: number | null;

  constructor(accountId: number, itemId: number, type: TutorialProductType, objectId: number | null) {
    this.accountId = accountId;
    this.itemId = itemId;
    this.type = type;
    this.objectId = objectId;
  }

  public static fromDto(accountId: number, itemId: number, dto: TutorialItemProductDto): TutorialItemProduct {
    return new TutorialItemProduct(accountId, itemId, dto.type, dto.objectId ?? null);
  }

  public toDto(): TutorialItemProductDto {
    return new TutorialItemProductDto({ type: this.type, objectId: this.objectId });
  }
}

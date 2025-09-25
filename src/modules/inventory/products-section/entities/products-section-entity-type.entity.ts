import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ProductsSectionEntityTypeDto } from '../dto';

@Entity()
export class ProductsSectionEntityType {
  @PrimaryColumn()
  sectionId: number;

  @PrimaryColumn()
  entityTypeId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, sectionId: number, entityTypeId: number) {
    this.accountId = accountId;
    this.sectionId = sectionId;
    this.entityTypeId = entityTypeId;
  }

  public static fromDto(accountId: number, dto: ProductsSectionEntityTypeDto): ProductsSectionEntityType {
    return new ProductsSectionEntityType(accountId, dto.sectionId, dto.entityTypeId);
  }

  public toDto(): ProductsSectionEntityTypeDto {
    return new ProductsSectionEntityTypeDto(this.sectionId, this.entityTypeId);
  }
}

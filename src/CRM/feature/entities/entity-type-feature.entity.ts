import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class EntityTypeFeature {
  @PrimaryColumn()
  entityTypeId: number;

  @PrimaryColumn()
  featureId: number;

  @Column()
  accountId: number;

  constructor(entityTypeId: number, featureId: number, accountId: number) {
    this.entityTypeId = entityTypeId;
    this.featureId = featureId;
    this.accountId = accountId;
  }
}

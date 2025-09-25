import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateEntityTypeLinkDto, EntityTypeLinkDto } from '../dto';

@Entity()
export class EntityTypeLink {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  sourceId: number;

  @Column()
  targetId: number;

  @Column()
  sortOrder: number;

  @Column()
  accountId: number;

  constructor(accountId: number, sourceId: number, targetId: number, sortOrder: number) {
    this.accountId = accountId;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.sortOrder = sortOrder;
  }

  public static fromDto(accountId: number, sourceId: number, dto: CreateEntityTypeLinkDto): EntityTypeLink {
    return new EntityTypeLink(accountId, sourceId, dto.targetId, dto.sortOrder);
  }

  public update({ sortOrder }: { sortOrder?: number }): EntityTypeLink {
    this.sortOrder = sortOrder !== undefined ? sortOrder : this.sortOrder;

    return this;
  }

  public toDto(): EntityTypeLinkDto {
    return { sourceId: this.sourceId, targetId: this.targetId, sortOrder: this.sortOrder };
  }
}

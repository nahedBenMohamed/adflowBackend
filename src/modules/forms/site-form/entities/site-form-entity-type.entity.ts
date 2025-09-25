import { Column, Entity, PrimaryColumn } from 'typeorm';

import { SiteFormEntityTypeDto } from '../dto';

@Entity()
export class SiteFormEntityType {
  @Column()
  accountId: number;

  @PrimaryColumn()
  formId: number;

  @PrimaryColumn()
  entityTypeId: number;

  @Column({ nullable: true })
  boardId: number | null;

  @Column()
  isMain: boolean;

  constructor(accountId: number, formId: number, entityTypeId: number, boardId: number | null, isMain: boolean) {
    this.accountId = accountId;
    this.formId = formId;
    this.entityTypeId = entityTypeId;
    this.boardId = boardId;
    this.isMain = isMain;
  }

  public static fromDto(accountId: number, formId: number, dto: SiteFormEntityTypeDto): SiteFormEntityType {
    return new SiteFormEntityType(accountId, formId, dto.entityTypeId, dto.boardId, dto.isMain);
  }

  public update(dto: SiteFormEntityTypeDto): SiteFormEntityType {
    this.entityTypeId = dto.entityTypeId !== undefined ? dto.entityTypeId : this.entityTypeId;
    this.boardId = dto.boardId !== undefined ? dto.boardId : this.boardId;

    return this;
  }

  public toDto(): SiteFormEntityTypeDto {
    return { entityTypeId: this.entityTypeId, boardId: this.boardId, isMain: this.isMain };
  }
}

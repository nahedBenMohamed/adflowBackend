import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ScenarioType } from '../enums';
import { VoximplantScenarioEntityDto } from '../dto';

@Entity()
export class VoximplantScenarioEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  scenarioType: ScenarioType;

  @Column({ nullable: true })
  contactId: number | null;

  @Column({ nullable: true })
  dealId: number | null;

  @Column({ nullable: true })
  boardId: number | null;

  @Column({ nullable: true })
  ownerId: number | null;

  constructor(
    accountId: number,
    scenarioType: ScenarioType,
    contactId: number | null,
    dealId: number | null,
    boardId: number | null,
    ownerId: number | null,
  ) {
    this.accountId = accountId;
    this.scenarioType = scenarioType;
    this.contactId = contactId;
    this.dealId = dealId;
    this.boardId = boardId;
    this.ownerId = ownerId;
  }

  public static fromDto(accountId: number, dto: VoximplantScenarioEntityDto): VoximplantScenarioEntity {
    return new VoximplantScenarioEntity(
      accountId,
      dto.scenarioType,
      dto.contactId,
      dto.dealId,
      dto.boardId,
      dto.ownerId,
    );
  }

  public toDto(): VoximplantScenarioEntityDto {
    return new VoximplantScenarioEntityDto(this.scenarioType, this.contactId, this.dealId, this.boardId, this.ownerId);
  }
}

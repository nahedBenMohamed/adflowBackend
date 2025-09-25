import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { UserRights } from '@/modules/iam/common';

import { BoardDto, CreateBoardDto, UpdateBoardDto } from '../dto';
import { BoardType } from '../enums';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  name: string;

  @Column()
  type: BoardType;

  @Column({ nullable: true })
  recordId: number | null;

  @Column()
  isSystem: boolean;

  @Column()
  ownerId: number | null;

  @Column({ type: 'jsonb' })
  participantIds: number[] | null;

  @Column()
  sortOrder: number;

  @Column()
  taskBoardId: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    name: string,
    type: BoardType,
    recordId: number | null,
    isSystem: boolean,
    ownerId: number | null,
    participantIds: number[] | null,
    sortOrder: number,
    taskBoardId: number | null,
  ) {
    this.accountId = accountId;
    this.name = name;
    this.type = type;
    this.recordId = recordId;
    this.isSystem = isSystem;
    this.ownerId = ownerId;
    this.participantIds = participantIds;
    this.sortOrder = sortOrder;
    this.taskBoardId = taskBoardId;
    this.createdAt = DateUtil.now();
  }

  private _userRights: UserRights | null;
  public get userRights(): UserRights {
    return this._userRights;
  }
  public set userRights(value: UserRights | null) {
    this._userRights = value;
  }

  public static fromDto({
    accountId,
    isSystem = false,
    ownerId = null,
    taskBoardId = null,
    dto,
  }: {
    accountId: number;
    isSystem?: boolean;
    ownerId?: number | null;
    taskBoardId?: number | null;
    dto: CreateBoardDto;
  }): Board {
    return new Board(
      accountId,
      dto.name,
      dto.type,
      dto.recordId,
      isSystem,
      ownerId,
      dto.participantIds,
      dto.sortOrder,
      taskBoardId,
    );
  }

  public update(dto: UpdateBoardDto): Board {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;
    this.participantIds = dto.participantIds !== undefined ? dto.participantIds : this.participantIds;

    return this;
  }

  public toDto(): BoardDto {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      recordId: this.recordId,
      isSystem: this.isSystem,
      ownerId: this.ownerId,
      participantIds: this.participantIds,
      sortOrder: this.sortOrder,
      taskBoardId: this.taskBoardId,
      userRights: this.userRights,
    };
  }
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

import { DateUtil } from '@/common';
import { BoardStageCode } from '../enums';
import { CreateBoardStageDto, BoardStageDto, UpdateBoardStageDto } from '../dto';

@Entity()
export class BoardStage {
  @PrimaryColumn()
  id: number;

  @Column()
  accountId: number;

  @Column()
  boardId: number;

  @Column()
  createdAt: Date;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  code: BoardStageCode | null;

  @Column()
  isSystem: boolean;

  @Column()
  sortOrder: number;

  constructor(
    accountId: number,
    id: number,
    boardId: number,
    name: string,
    color: string,
    code: BoardStageCode | null,
    isSystem: boolean,
    sortOrder: number,
  ) {
    this.accountId = accountId;
    this.id = id;
    this.boardId = boardId;
    this.name = name;
    this.color = color;
    this.code = code;
    this.isSystem = isSystem;
    this.sortOrder = sortOrder;
    this.createdAt = DateUtil.now();
  }

  public static fromDto(accountId: number, boardId: number, dto: CreateBoardStageDto): BoardStage {
    return new BoardStage(
      accountId,
      dto.id,
      boardId,
      dto.name,
      dto.color,
      dto.code,
      dto.isSystem ?? false,
      dto.sortOrder ?? 0,
    );
  }

  public update(dto: Omit<UpdateBoardStageDto, 'id'>): BoardStage {
    this.name = dto.name !== undefined ? dto.name : this.name;
    this.color = dto.color !== undefined ? dto.color : this.color;
    this.code = dto.code !== undefined ? dto.code : this.code;
    this.isSystem = dto.isSystem !== undefined ? dto.isSystem : this.isSystem;
    this.sortOrder = dto.sortOrder !== undefined ? dto.sortOrder : this.sortOrder;

    return this;
  }

  public toDto(): BoardStageDto {
    return {
      id: this.id,
      boardId: this.boardId,
      name: this.name,
      color: this.color,
      code: this.code,
      isSystem: this.isSystem,
      sortOrder: this.sortOrder,
    };
  }
}

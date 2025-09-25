import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TutorialItemUser {
  @PrimaryColumn()
  itemId: number;

  @PrimaryColumn()
  userId: number;

  constructor(itemId: number, userId: number) {
    this.itemId = itemId;
    this.userId = userId;
  }
}

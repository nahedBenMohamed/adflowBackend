import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UsersAccessibleUsers {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  accessibleId: number;

  constructor(userId: number, accessibleId: number) {
    this.userId = userId;
    this.accessibleId = accessibleId;
  }
}

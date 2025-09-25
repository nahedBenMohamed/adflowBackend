/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersAccessibleUsers1731239585214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table users_accessible_users (
        user_id integer not null,
        accessible_id integer not null,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (accessible_id) references users(id) on delete cascade,
        primary key (user_id, accessible_id)
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TutorialItemUser1710939538331 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table tutorial_item_user (
        item_id integer not null,
        user_id integer not null,
        primary key (item_id, user_id),
        foreign key (item_id) references tutorial_item(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

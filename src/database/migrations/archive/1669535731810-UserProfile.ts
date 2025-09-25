/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UserProfile1669535731810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table user_profile (
        created_at      timestamp without time zone not null,
        user_id         integer not null,
        birth_date      timestamp without time zone,
        employment_date timestamp without time zone,
        account_id      integer                     not null,
        primary key (user_id),
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

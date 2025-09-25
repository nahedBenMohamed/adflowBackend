/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomationEntityType1719396909800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table automation_entity_type (
        id integer generated always as identity,
        account_id integer not null,
        created_at timestamp without time zone not null default now(),
        created_by integer not null,
        name text not null,
        is_active boolean not null,
        triggers text not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (created_by) references users(id)
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

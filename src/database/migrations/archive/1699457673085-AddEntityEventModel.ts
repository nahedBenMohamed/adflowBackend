/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityEventModel1699457673085 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // language=SQL format=false
    await queryRunner.query(`
      create table entity_event (
        id integer generated always as identity primary key,
        account_id integer not null references account(id) on delete cascade,
        entity_id integer not null references entity(id) on delete cascade,
        object_id integer not null,
        type character varying not null,
        created_at timestamp without time zone not null
    );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

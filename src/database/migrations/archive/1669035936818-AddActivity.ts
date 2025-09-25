/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivity1669035936818 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table activity (
        id                  bigint,
        created_at          timestamp without time zone not null,
        account_id          integer                     not null,
        created_by          integer                     not null,
        responsible_user_id integer                     not null,
        text                character varying           not null,
        start_date          timestamp without time zone not null,
        end_date            timestamp without time zone not null,
        is_resolved         boolean                     not null,
        result              character varying,
        task_type_id        integer                     not null,
        entity_id           bigint                      not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (created_by) references users(id) on delete cascade,
        foreign key (responsible_user_id) references users(id) on delete cascade,
        foreign key (entity_id) references entity(id),
        foreign key (task_type_id) references task_type(id)
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

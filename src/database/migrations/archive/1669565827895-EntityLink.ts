/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityLink1669565827895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence entity_link_id_seq as bigint;

      create table entity_link (
        id            bigint,
        source_id     integer not null,
        target_id     integer not null,
        sort_order    smallint not null,
        back_link_id  bigint,
        account_id    integer not null,
        primary key (id),
        foreign key (source_id) references entity(id) on delete cascade,
        foreign key (target_id) references entity(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (back_link_id) references entity_link(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

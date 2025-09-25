/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityTypeLink1669545773479 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence entity_type_link_id_seq as bigint;

      create table entity_type_link (
        id          bigint  default nextval('entity_type_link_id_seq'::regclass),
        source_id   integer not null,
        target_id   integer not null,
        sort_order  smallint not null,
        account_id  integer not null,
        primary key (id),
        foreign key (source_id) references entity_type(id) on delete cascade,
        foreign key (target_id) references entity_type(id) on delete cascade,
        foreign key (account_id) references account (id) on delete cascade
      ); 
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

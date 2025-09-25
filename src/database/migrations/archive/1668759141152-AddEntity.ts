/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntity1668759141152 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table entity
        (
            id                  bigint       not null
                primary key,
            name                varchar(255) not null,
            entity_type_id      integer      not null
                references entity_type on delete cascade,
            responsible_user_id integer      not null
                references users on delete cascade,
            stage_id            integer
                references stage on delete cascade,
            created_by          integer      not null
                references users on delete cascade,
            account_id          integer      not null
                references account on delete cascade,
            created_at          timestamp without time zone not null
        );
        create sequence entity_id_seq as integer minvalue 14022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

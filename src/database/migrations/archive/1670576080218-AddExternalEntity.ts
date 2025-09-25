/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalEntity1670576080218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists external_entity_id_seq as bigint minvalue 30022001;

      create table external_entity (
          id integer DEFAULT nextval('external_entity_id_seq'::regclass),
          entity_id integer NOT NULL,
          url character varying NOT NULL,
          account_id integer NOT NULL,
          created_at timestamp without time zone NOT NULL,
          primary key (id),
          foreign key (entity_id) references entity(id),
          foreign key (account_id) references account(id)
      );    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

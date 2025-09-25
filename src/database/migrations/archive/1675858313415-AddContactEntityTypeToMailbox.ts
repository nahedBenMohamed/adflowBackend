/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactEntityTypeToMailbox1675858313415 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        add column contact_entity_type_id integer,
        add foreign key (contact_entity_type_id) references entity_type(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeadEntityTypeToMailbox1675858907059 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        add column lead_entity_type_id integer,
        add foreign key (lead_entity_type_id) references entity_type(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

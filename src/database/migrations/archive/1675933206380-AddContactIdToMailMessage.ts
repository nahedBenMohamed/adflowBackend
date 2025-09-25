/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactIdToMailMessage1675933206380 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message
        add column contact_entity_id integer,
        add foreign key (contact_entity_id) references entity(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

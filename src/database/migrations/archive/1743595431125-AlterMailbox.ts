/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailbox1743595431125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        drop column create_contact,
        drop column contact_entity_type_id,
        drop column lead_entity_type_id,
        drop column lead_board_id,
        drop column create_lead;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

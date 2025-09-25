/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertMailboxEntitySettings1743595365132 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
insert into mailbox_entity_settings (account_id, mailbox_id, contact_entity_type_id, lead_entity_type_id, lead_board_id, owner_id, check_active_lead, check_duplicate)
select m.account_id, m.id as mailbox_id, m.contact_entity_type_id, m.lead_entity_type_id, m.lead_board_id, m.owner_id, false as check_active_lead, false as check_duplicate
from mailbox m where (m.create_contact = true and m.contact_entity_type_id is not null) or (m.create_lead = true and m.lead_entity_type_id is not null);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

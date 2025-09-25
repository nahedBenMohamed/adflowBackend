/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSetNullOnDeleteToMailbox1676281117335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    alter table mailbox
      drop constraint mailbox_contact_entity_type_id_fkey,
      drop constraint mailbox_lead_entity_type_id_fkey,
      drop constraint mailbox_lead_board_id_fkey,
      add constraint mailbox_contact_entity_type_id_fkey foreign key (contact_entity_type_id) references entity_type(id) on delete set null,
      add constraint mailbox_lead_entity_type_id_fkey foreign key (lead_entity_type_id) references entity_type(id) on delete set null,
      add constraint mailbox_lead_board_id_fkey foreign key (lead_board_id) references board(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxEntitySettings1743592762254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table mailbox_entity_settings (
        mailbox_id integer,
        account_id integer not null,
        contact_entity_type_id integer,
        lead_entity_type_id integer,
        lead_board_id integer,
        lead_stage_id integer,
        lead_name text,
        owner_id integer,
        check_active_lead boolean not null default false,
        check_duplicate boolean not null default false,
        primary key (mailbox_id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (contact_entity_type_id) references entity_type(id) on delete set null,
        foreign key (lead_entity_type_id) references entity_type(id) on delete set null,
        foreign key (lead_board_id) references board(id) on delete set null,
        foreign key (lead_stage_id) references board_stage(id) on delete set null,
        foreign key (owner_id) references users(id) on delete set null
      )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

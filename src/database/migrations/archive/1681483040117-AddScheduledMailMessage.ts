/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduledMailMessage1681483040117 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table scheduled_mail_message
        (
            id           integer,
            send_to      jsonb             not null,
            subject      character varying not null,
            content      character varying,
            send_as_html boolean           not null,
            file_ids     jsonb             not null,
            sent_at      timestamp without time zone,
            mailbox_id   integer           not null,
            user_id      integer           not null,
            entity_id    integer,
            action_id    integer,
            account_id   integer           not null,
            primary key (id),
            foreign key (mailbox_id) references mailbox (id) on delete cascade,
            foreign key (user_id) references users (id) on delete cascade,
            foreign key (entity_id) references entity (id) on delete set null,
            foreign key (action_id) references action (id) on delete set null,
            foreign key (account_id) references account (id) on delete cascade
        );

        create sequence if not exists scheduled_mail_message_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

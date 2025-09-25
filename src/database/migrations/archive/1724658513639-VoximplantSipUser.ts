/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantSipUser1724658513639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table voximplant_sip_user (
        sip_id integer,
        user_id integer,
        account_id integer not null,
        primary key (sip_id, user_id),
        foreign key (sip_id) references voximplant_sip(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

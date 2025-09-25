/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeadBoardIdToMailbox1675932022996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox
        add column lead_board_id integer,
        add foreign key (lead_board_id) references board(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

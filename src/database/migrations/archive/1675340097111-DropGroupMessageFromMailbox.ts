/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DropGroupMessageFromMailbox1675340097111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox drop column group_message;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

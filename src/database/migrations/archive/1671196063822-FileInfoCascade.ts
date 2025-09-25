/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FileInfoCascade1671196063822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_info
        drop constraint file_info_account_id_fkey,
        add constraint file_info_account_id_fkey foreign key (account_id) references account(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

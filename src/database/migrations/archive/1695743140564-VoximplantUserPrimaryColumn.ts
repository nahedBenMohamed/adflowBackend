/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantUserPrimaryColumn1695743140564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_user
        drop column id,
        add primary key (user_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

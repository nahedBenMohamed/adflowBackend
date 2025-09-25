/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignatureToEmailActionSettings1686310775887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table email_action_settings
            add signature varchar;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

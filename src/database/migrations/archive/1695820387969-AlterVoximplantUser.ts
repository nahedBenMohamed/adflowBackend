/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterVoximplantUser1695820387969 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_user rename column voximplant_id to external_id;
      alter table voximplant_user rename column voximplant_username to username;
      alter table voximplant_user rename column voximplant_password to password;    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantUserPassword1695808984339 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_user add column voximplant_password character varying not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

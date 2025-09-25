/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSequenceToSubscriptionId1673515827427 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table subscription alter column id drop identity;
      drop sequence if exists subscription_id_seq;
      create sequence if not exists subscription_id_seq as integer minvalue 16022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

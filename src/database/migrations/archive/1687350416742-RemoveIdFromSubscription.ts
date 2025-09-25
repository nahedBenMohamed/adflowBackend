/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIdFromSubscription1687350416742 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table subscription
        drop column id,
        add primary key (account_id);

      drop sequence subscription_id_seq;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

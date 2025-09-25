/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TelephonyCallsToEntityEvent1700591906266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into entity_event (account_id, entity_id, object_id, type, created_at)
        select v.account_id, v.entity_id, v.id as object_id, 'telephony-call' as type, created_at
        from voximplant_call v
        where v.entity_id is not null
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailMessageScheduled1730796442786 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from mail_message_scheduled where entity_id is null;

      ALTER TABLE mail_message_scheduled
        DROP CONSTRAINT mail_message_scheduled_entity_id_fkey,
        ADD CONSTRAINT mail_message_scheduled_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES entity(id) ON DELETE CASCADE,
        ALTER COLUMN entity_id SET NOT NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

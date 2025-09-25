/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParticipantsToEntity1680499051021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table entity
            add column participant_ids jsonb;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

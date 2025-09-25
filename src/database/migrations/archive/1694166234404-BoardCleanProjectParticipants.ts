/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardCleanProjectParticipants1694166234404 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update board
      set is_system = false, participant_ids = '[]'
      where type = 'task' and is_system = true and owner_id is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

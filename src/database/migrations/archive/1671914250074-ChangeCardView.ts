/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCardView1671914250074 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        update entity_type set card_view = 'deal'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

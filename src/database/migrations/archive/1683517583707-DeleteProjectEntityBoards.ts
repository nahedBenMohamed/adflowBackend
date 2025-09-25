/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteProjectEntityBoards1683517583707 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        delete from board
        where type = 'entity';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

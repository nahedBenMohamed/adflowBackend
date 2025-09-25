/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemColumnToBoard1675080091774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table board
            add is_system boolean default false not null;

        update board
        set is_system = true
        where name = 'Tasks board';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

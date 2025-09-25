/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserDepartment1722871843239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table users
        drop constraint users_department_id_fkey,
        add constraint users_department_id_fkey foreign key (department_id) references department(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

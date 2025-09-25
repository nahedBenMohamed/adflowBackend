/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterObjectPermission1728981267739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table object_permission
        add column user_id integer,
        add foreign key (user_id) references users(id) on delete cascade;

      update object_permission set user_id = (
        select user_id from user_object_permission uop where uop.object_permission_id = object_permission.id
      );

      delete from object_permission where user_id is null;
      alter table object_permission alter column user_id set not null;

      drop table user_object_permission;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

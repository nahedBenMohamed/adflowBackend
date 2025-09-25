/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityCopiedFromConstrains1725980172270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update entity
      set copied_from = null, copied_count = null
      where entity.copied_from is not null and not exists (select id from entity e2 where e2.id = entity.copied_from);

      alter table entity add foreign key (copied_from) references entity(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

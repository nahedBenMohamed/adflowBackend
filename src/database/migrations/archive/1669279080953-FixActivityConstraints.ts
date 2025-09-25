/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixActivityConstraints1669279080953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table activity drop constraint activity_entity_id_fkey;
        alter table activity
            add foreign key (entity_id) references entity (id)
                on delete cascade;

        alter table activity drop constraint activity_task_type_id_fkey;
        alter table activity
            add foreign key (task_type_id) references task_type (id)
                on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

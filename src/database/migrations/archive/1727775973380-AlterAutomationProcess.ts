/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationProcess1727775973380 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_process
        add column created_by integer,
        add column name text,
        add column type text,
        add column object_id integer,
        add column is_readonly boolean default false,
        add foreign key (created_by) references users(id);

      update automation_process ap
      set
        created_by = aet.created_by,
        name = aet.name,
        type = 'entity_type',
        object_id = aet.entity_type_id,
        is_readonly = true
      from automation_entity_type aet
      where aet.process_id = ap.id;

      alter table automation_process
        alter column created_by set not null,
        alter column name set not null,
        alter column type set not null,
        alter column is_readonly set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

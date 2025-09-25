/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeToBoard1675350490867 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table board
            add code varchar(255);

        alter table board
            add constraint board__code__account_id__uniq
                unique (code, account_id);

        update board
        set code = 'deals'
        where name = 'Deals';

        update board
        set code = 'leads'
        where name = 'Leads';

        update board
        set code = 'projects'
        where name = 'Projects';

        update board
        set code = 'tasks'
        where name = 'Tasks board';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

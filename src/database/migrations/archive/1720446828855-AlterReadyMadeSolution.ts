/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterReadyMadeSolution1720446828855 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table ready_made_solution
        add column account_id integer,
        add foreign key (account_id) references account(id);

      update ready_made_solution rms
        set account_id = acc.id
        from account acc
        where rms.subdomain = acc.subdomain;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

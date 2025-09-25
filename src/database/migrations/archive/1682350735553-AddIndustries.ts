/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndustries1682350735553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into industry(code, name, color, sort_order, active)
        values ('it_and_development', 'IT & Development', '#FF8D07', 0, true),
               ('construction_and_engineering', 'Construction and engineering', '#A33CAB', 1, true),
               ('advertising_and_marketing', 'Advertising & Marketing', '#67E2F9', 2, true),
               ('consulting_and_outsourcing', 'Consulting and outsourcing', '#8AF039', 3, true),
               ('manufacturing', 'Manufacturing', '#EC008C', 4, true),
               ('education', 'Education', '#3D8FEC', 5, true);
    `);

    await queryRunner.query(`
        alter table ready_made_solution
            alter column industry_code drop not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

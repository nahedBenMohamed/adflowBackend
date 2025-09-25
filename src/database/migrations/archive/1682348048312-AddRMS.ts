/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRMS1682348048312 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table industry
        (
            code       varchar  not null,
            name       varchar  not null,
            color      varchar  not null,
            sort_order smallint not null,
            active     boolean  not null,
            primary key (code)
        );

        create table ready_made_solution
        (
            code          varchar  not null,
            name          varchar  not null,
            subdomain     varchar  not null,
            sort_order    smallint not null,
            active        boolean  not null,
            industry_code varchar  not null,
            primary key (code),
            foreign key (industry_code) references industry (code)
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

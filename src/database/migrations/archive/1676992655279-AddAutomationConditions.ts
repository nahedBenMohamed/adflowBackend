/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutomationConditions1676992655279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table condition
        (
            id         integer,
            type       varchar(100) not null,
            account_id integer      not null,
            primary key (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence condition_id_seq as integer minvalue 51011001;

        create table automation_condition
        (
            automation_id integer,
            condition_id  integer,
            account_id    integer not null,
            foreign key (automation_id) references automation (id) on delete cascade,
            foreign key (condition_id) references condition (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade,
            primary key (automation_id, condition_id)
        );

        create table user_condition
        (
            condition_id integer,
            user_id      integer,
            account_id   integer not null,
            foreign key (condition_id) references condition (id) on delete cascade,
            foreign key (user_id) references users (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade,
            primary key (condition_id, user_id)
        );

        create table field_condition
        (
            condition_id integer,
            field_id     integer     not null,
            field_type   varchar(50) not null,
            payload      jsonb       not null,
            account_id   integer     not null,
            primary key (condition_id),
            foreign key (condition_id) references condition (id) on delete cascade,
            foreign key (field_id) references field (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

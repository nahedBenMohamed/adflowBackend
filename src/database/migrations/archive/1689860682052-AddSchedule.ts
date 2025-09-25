/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSchedule1689860682052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists schedule_id_seq as integer minvalue 1;
      create table schedule (
        id integer,
        name character varying not null,
        use_product boolean not null,
        entity_type_id integer,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (entity_type_id) references entity_type(id) on delete set null,
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence if not exists schedule_performer_id_seq as integer minvalue 1;
      create table schedule_performer (
        id integer,
        schedule_id integer not null,
        user_id integer not null,
        account_id integer not null,
        primary key (id),
        foreign key (schedule_id) references schedule(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create sequence if not exists schedule_event_id_seq as integer minvalue 1;
      create table schedule_event (
        id integer,
        schedule_id integer not null,
        start_date timestamp without time zone not null,
        end_date timestamp without time zone not null,
        status character varying not null,
        comment character varying,
        owner_id integer not null,
        entity_id integer,
        performer_id integer,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (schedule_id) references schedule(id) on delete cascade,
        foreign key (owner_id) references users(id),
        foreign key (entity_id) references entity(id) on delete set null,
        foreign key (performer_id) references schedule_performer(id) on delete set null,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

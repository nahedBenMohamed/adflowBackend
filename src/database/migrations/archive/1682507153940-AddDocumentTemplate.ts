/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentTemplate1682507153940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists document_template_id_seq as integer minvalue 1;

      create table document_template (
        id integer,
        name character varying not null,
        created_by integer not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (created_by) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );

      create table document_template_access (
        document_template_id integer,
        user_id integer,
        account_id integer not null,
        primary key (document_template_id, user_id),
        foreign key (document_template_id) references document_template(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create table document_template_entity_type (
        document_template_id integer,
        entity_type_id integer,
        account_id integer not null,
        primary key (document_template_id, entity_type_id),
        foreign key (document_template_id) references document_template(id) on delete cascade,
        foreign key (entity_type_id) references entity_type(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

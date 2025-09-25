/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldValue1669732421801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table field_value
        (
            id         bigint  not null,
            field_id   integer not null,
            payload    jsonb   not null,
            entity_id  bigint  not null,
            account_id integer not null,
            primary key (id),
            foreign key (field_id) references field (id) on delete cascade,
            foreign key (entity_id) references entity (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade,
            constraint field_id__entity_id__uniq
                unique (field_id, entity_id)
        );
        create sequence field_value_id_seq as bigint minvalue 44022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

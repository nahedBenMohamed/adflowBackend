/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectFields1681224301468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        update entity_type
        set need_migration = false
        where need_migration = true;

        update board
        set need_migration = false
        where need_migration = true;
    `);

    await queryRunner.query(`
        update entity_type
        set need_migration = true
        where entity_type.id in (select et.id
                                 from entity_type et
                                          left join field f on et.id = f.entity_type_id and f.code = 'value'
                                 where f.id is null
                                   and et.entity_category = 'project');

        insert into field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code,
                           active)
        select nextval('field_id_seq'::regclass),
               'Value',
               'value',
               0,
               et.id,
               null,
               et.account_id,
               now(),
               'value',
               true
        from entity_type et
        where et.need_migration = true;

        insert into field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code,
                           active)
        select nextval('field_id_seq'::regclass),
               'Start date',
               'date',
               1,
               et.id,
               null,
               et.account_id,
               now(),
               'start_date',
               true
        from entity_type et
        where et.need_migration = true;

        insert into field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code,
                           active)
        select nextval('field_id_seq'::regclass),
               'End date',
               'date',
               2,
               et.id,
               null,
               et.account_id,
               now(),
               'end_date',
               true
        from entity_type et
        where et.need_migration = true;

        insert into field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code,
                           active)
        select nextval('field_id_seq'::regclass),
               'Participants',
               'participants',
               3,
               et.id,
               null,
               et.account_id,
               now(),
               'participants',
               true
        from entity_type et
        where et.need_migration = true;

        insert into field (id, name, type, sort_order, entity_type_id, field_group_id, account_id, created_at, code,
                           active)
        select nextval('field_id_seq'::regclass),
               'Description',
               'text',
               4,
               et.id,
               null,
               et.account_id,
               now(),
               'description',
               true
        from entity_type et
        where et.need_migration = true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

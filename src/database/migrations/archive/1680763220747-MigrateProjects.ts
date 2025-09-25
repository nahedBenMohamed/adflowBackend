/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateProjects1680763220747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table board
            add column need_migration boolean default false;

        insert into board(id, name, type, record_id, account_id, created_at, sort_order, is_system, code,
                          need_migration)
        select nextval('board_id_seq'::regclass) as board_id,
               'Project tasks',
               'entity',
               eb.entity_id,
               eb.account_id,
               now(),
               0,
               false,
               null,
               true
        from (select e.id as entity_id, b.id as board_id, e.account_id as account_id
              from entity e
                       inner join entity_type et on et.id = e.entity_type_id and et.entity_category = 'project'
                       left join board b on b.type = 'entity' and b.record_id = e.id) eb
        where eb.board_id is null;

--         Add Stages
        insert into stage (id, name, color, code, is_system, sort_order, board_id, account_id, created_at)
        select nextval('stage_id_seq'::regclass),
               'To Do',
               '#555',
               null,
               false,
               0,
               b.id,
               b.account_id,
               now()
        from board b
        where b.need_migration = true;

        insert into stage (id, name, color, code, is_system, sort_order, board_id, account_id, created_at)
        select nextval('stage_id_seq'::regclass),
               'In Progress',
               '#555',
               null,
               false,
               1,
               b.id,
               b.account_id,
               now()
        from board b
        where b.need_migration = true;

        insert into stage (id, name, color, code, is_system, sort_order, board_id, account_id, created_at)
        select nextval('stage_id_seq'::regclass),
               'Done',
               '#555',
               'done',
               true,
               2,
               b.id,
               b.account_id,
               now()
        from board b
        where b.need_migration = true;
    `);

    await queryRunner.query(`
        alter table entity_type
            add column need_migration boolean default false;

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

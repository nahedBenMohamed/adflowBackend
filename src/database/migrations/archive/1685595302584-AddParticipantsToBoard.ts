/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParticipantsToBoard1685595302584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table board
            add owner_id integer,
            add foreign key (owner_id) references users (id) on
        delete
        set null;

        alter table board
            add participant_ids jsonb;

        UPDATE board
        SET owner_id = subquery.owner_id FROM (SELECT u.id as owner_id, u.account_id FROM users u where u.role = 'owner' group by u.account_id, u.id) subquery
        WHERE board.account_id = subquery.account_id
          and board.type = 'task'
          and board.code is null;

        UPDATE board
        SET participant_ids = subquery.participants FROM (SELECT json_agg(u.id) as participants, u.account_id
        FROM users u
        WHERE u.is_active = true
        GROUP BY account_id) AS subquery
        WHERE board.account_id = subquery.account_id
          and board.type = 'task'
          and board.code is null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

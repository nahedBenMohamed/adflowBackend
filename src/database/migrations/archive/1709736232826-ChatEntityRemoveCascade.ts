/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatEntityRemoveCascade1709736232826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat
        drop constraint chat_entity_id_fkey,
        add constraint chat_entity_id_fkey foreign key (entity_id) references entity(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

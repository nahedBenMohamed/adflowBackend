/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotification1676994397217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      CREATE TABLE notification (
        "id" integer,
        "account_id" integer NOT NULL,
        "created_at" timestamp without time zone NOT NULL,
        "type" character varying NOT NULL,
        "object_id" integer NOT NULL,
        "entity_id" integer,
        "from_user" integer,
        "title" character varying,
        "description" character varying NOT NULL,
        "is_seen" boolean NOT NULL DEFAULT false,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("account_id") REFERENCES account(id) ON DELETE CASCADE,
        FOREIGN KEY ("entity_id") REFERENCES entity(id) ON DELETE SET NULL,
        FOREIGN KEY ("from_user") REFERENCES users(id) ON DELETE SET NULL
      );

      create sequence notification_id_seq as integer minvalue 61011001;
  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

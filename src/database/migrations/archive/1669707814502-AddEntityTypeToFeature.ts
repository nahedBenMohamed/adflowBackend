/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityTypeToFeature1669707814502 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table entity_type_feature (
        entity_type_id integer not null,
        feature_id smallint not null,
        primary key (entity_type_id, feature_id),
        foreign key (entity_type_id) references entity_type(id) on delete cascade,
        foreign key (feature_id) references feature(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

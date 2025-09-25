/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeatureDocuments1683731671898 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into feature("name", "code", "is_enabled") values('Create Documents', 'documents', TRUE);

      insert into entity_type_feature (entity_type_id, feature_id, account_id)
        select id as entity_type_id, currval('feature_id_seq') as feature_id, account_id
        from entity_type;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

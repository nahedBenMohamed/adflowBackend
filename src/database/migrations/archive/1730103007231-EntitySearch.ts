/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntitySearch1730103007231 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
  -- entity
ALTER TABLE entity ADD COLUMN IF NOT EXISTS name_tsv tsvector;

UPDATE entity SET name_tsv = to_tsvector('simple', lower(name));

CREATE OR REPLACE FUNCTION update_name_tsv() RETURNS trigger AS $$
BEGIN
    NEW.name_tsv := to_tsvector('simple', lower(NEW.name));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_name_tsv
BEFORE INSERT OR UPDATE ON entity
FOR EACH ROW
EXECUTE FUNCTION update_name_tsv();

CREATE INDEX IF NOT EXISTS idx_entity_name_tsv ON entity USING GIN (name_tsv);

CREATE INDEX IF NOT EXISTS idx_entity_account_entity_type_created_at_id
ON entity (account_id, entity_type_id, created_at DESC, id DESC);

-- field value
ALTER TABLE field_value ADD COLUMN IF NOT EXISTS payload_tsv tsvector;
UPDATE field_value
SET payload_tsv = CASE
    WHEN field_type IN ('text', 'link') THEN to_tsvector('simple', lower(payload->>'value'))
    WHEN field_type = 'multitext' THEN to_tsvector('simple', lower(payload->>'values'))
    WHEN field_type = 'email' THEN to_tsvector('simple', lower(payload->>'values'))
    WHEN field_type = 'phone' THEN to_tsvector('simple', lower(replace(payload->>'values', ' ', '')))
    ELSE NULL
END;

CREATE OR REPLACE FUNCTION update_field_value_payload_tsv()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payload_tsv = CASE
        WHEN NEW.field_type IN ('text', 'link') THEN to_tsvector('simple', lower(NEW.payload->>'value'))
        WHEN NEW.field_type = 'multitext' THEN to_tsvector('simple', lower(NEW.payload->>'values'))
        WHEN NEW.field_type = 'email' THEN to_tsvector('simple', lower(NEW.payload->>'values'))
        WHEN NEW.field_type = 'phone' THEN to_tsvector('simple', lower(replace(NEW.payload->>'values', ' ', '')))
        ELSE NULL
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_field_value_payload_tsv
BEFORE INSERT OR UPDATE OF payload, field_type ON field_value
FOR EACH ROW
EXECUTE FUNCTION update_field_value_payload_tsv();

CREATE INDEX IF NOT EXISTS idx_field_value_payload_tsv
ON field_value USING GIN (payload_tsv);
      `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

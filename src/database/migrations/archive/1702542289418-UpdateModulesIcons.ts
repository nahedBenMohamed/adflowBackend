/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateModulesIcons1702542289418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update schedule set icon = 'calendar_4';
      update products_section set icon = 'box';
      update entity_type set section_icon = 'crown' where entity_category = 'deal';
      update entity_type set section_icon = 'user_2' where entity_category = 'contact';
      update entity_type set section_icon = 'building_2' where entity_category = 'company';
      update entity_type set section_icon = 'bulb' where entity_category = 'project';
      update entity_type set section_icon = 'star_2' where entity_category = 'hr';
      update entity_type set section_icon = 'product_1' where entity_category = 'supplier';
      update entity_type set section_icon = 'tie_2' where entity_category = 'contractor';
      update entity_type set section_icon = 'star_1' where entity_category = 'universal';
      update entity_type set section_icon = 'shapes_3' where entity_category = 'partner';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

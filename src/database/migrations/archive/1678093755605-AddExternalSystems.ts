/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalSystems1678093755605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into external_system(id, name, code, url_templates) values(4, 'Pipedrive', 'pipedrive', '{pipedrive.com}');
      insert into external_system(id, name, code, url_templates) values(5, 'HubSpot', 'hubspot', '{hubspot.com}');
      insert into external_system(id, name, code, url_templates) values(6, 'Freshsales', 'freshsales', '{freshworks.com,myfreshworks.com}');
      insert into external_system(id, name, code, url_templates) values(7, 'Zoho', 'zoho', '{zoho.com}');
      insert into external_system(id, name, code, url_templates) values(8, 'Twitter', 'twitter', '{twitter.com}');
      insert into external_system(id, name, code, url_templates) values(9, 'Instagram', 'instagram', '{instagram.com}');
      insert into external_system(id, name, code, url_templates) values(10, 'Notion', 'notion', '{notion.so}');
      insert into external_system(id, name, code, url_templates) values(11, 'Zendesk', 'zendesk', '{zendesk.com}');
      insert into external_system(id, name, code, url_templates) values(12, 'SugarCRM', 'sugarcrm', '{sugarcrm.com}');
      insert into external_system(id, name, code, url_templates) values(13, 'Monday', 'monday', '{monday.com}');
      insert into external_system(id, name, code, url_templates) values(14, 'amoCRM', 'amocrm', '{amocrm.ru,kommo.com}');
      insert into external_system(id, name, code, url_templates) values(15, 'Bitrix24', 'bitrix', '{bitrix24.ru,bitrix24.com,bitrix24.es,bitrix24.eu,bitrix24.de,bitrix24.fr,bitrix24.pl,bitrix24.it,bitrix24.uk}');    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTutorialItem1729680141757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update tutorial_item set link = 'https://rutube.ru/video/7866956dff4e26e1c898c1a31450b3ff' where link = 'https://youtu.be/niN8RMBBd3M';
      update tutorial_item set link = 'https://rutube.ru/video/1fc6c8cf6306c32f7775dc91b557fe6b' where link = 'https://youtu.be/GyqNL-Rqs2o';
      update tutorial_item set link = 'https://rutube.ru/video/55cfc3a2a8fe8d891cab17135d6d758a' where link = 'https://youtu.be/M6LmudYIVIg';
      update tutorial_item set link = 'https://rutube.ru/video/76111a083b5579cb8c7e3e3fb6b225f8' where link = 'https://youtu.be/fhweWoG-qwI';
      update tutorial_item set link = 'https://rutube.ru/video/d0b6ff03e0005f31236d8fa1d31a942d' where link = 'https://youtu.be/Bo0UNdxB130';
      update tutorial_item set link = 'https://rutube.ru/video/c5a7cfbeda45bd110f0cba20bcc399ac' where link = 'https://youtu.be/sy202rfbuB0';
      update tutorial_item set link = 'https://rutube.ru/video/286a3a8bd132332648bb7a37e313943c' where link = 'https://youtu.be/vZ6XDuYBDfY';
      update tutorial_item set link = 'https://rutube.ru/video/2384f907194a481a9d88486d85772496' where link = 'https://youtu.be/uQaowrrf6DQ';
      update tutorial_item set link = 'https://rutube.ru/video/861b2a529cf2fb93109df88e55458be2' where link = 'https://youtu.be/d7TK5yPIa1k';
      update tutorial_item set link = 'https://rutube.ru/video/e2b52a8139e7da53fd280c1e37694e04' where link = 'https://youtu.be/x6Fy9FazN9k';
      update tutorial_item set link = 'https://rutube.ru/video/39a6b69a7042b6318a22eeedc08cdf51' where link = 'https://youtu.be/ui5G50e9aV4';
      update tutorial_item set link = 'https://rutube.ru/video/d6c71e34f6ff41463616f3884d1e0b7a' where link = 'https://youtu.be/aaV12UJqq1M';
      update tutorial_item set link = 'https://rutube.ru/video/58c01491d9b6391eb5e59f19d58e47c5' where link = 'https://youtu.be/_vW9prpKSSo';
      update tutorial_item set link = 'https://rutube.ru/video/d0a83e46fa070e0c763d916ec4d7f9fd' where link = 'https://youtu.be/tpP7Ra7SwK4';
      update tutorial_item set link = 'https://rutube.ru/video/203a6cea52d5935c4503f2632373b87b' where link = 'https://youtu.be/oHAQMEfZSBY';
      update tutorial_item set link = 'https://rutube.ru/video/dedae77a65ded0aa531f8c5c90075f45' where link = 'https://youtu.be/WRZn2sGlw_s';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

export class NestjsLogger implements TypeOrmLogger {
  private readonly logger = new Logger('SQL');

  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.log(`Query: ${query}${parameters ? ` -- PARAMETERS: ${JSON.stringify(parameters)}` : ''}`);
  }

  logQueryError(error: string, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.error(
      `Error: ${error} Query: ${query}${parameters ? ` -- PARAMETERS: ${JSON.stringify(parameters)}` : ''}`,
    );
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    this.logger.warn(
      `SLOW Query: ${query}${parameters ? ` -- PARAMETERS: ${JSON.stringify(parameters)}` : ''}\t[${time}ms]`,
    );
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`Schema Build: ${message}`);
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown, _queryRunner?: QueryRunner) {
    if (level === 'log') {
      this.logger.log(message);
    } else if (level === 'info') {
      this.logger.debug(message);
    } else if (level === 'warn') {
      this.logger.warn(message);
    }
  }
}

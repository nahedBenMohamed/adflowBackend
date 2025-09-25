import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

const WEIGHT_MIN = 100.0;
const WEIGHT_STEP = 100.0;

@Injectable()
export class BaseTaskService {
  constructor(private dataSource: DataSource) {}

  public async calculateWeight(
    accountId: number,
    afterId: number | null | undefined,
    beforeId: number | null | undefined,
  ): Promise<number> {
    let afterWeight = afterId ? await this.getWeightById(accountId, afterId) : null;
    let beforeWeight = beforeId ? await this.getWeightById(accountId, beforeId) : null;
    if (afterWeight === null && beforeWeight === null) {
      const minWeight = await this.getMinWeightForAccount(accountId);
      return minWeight === null ? WEIGHT_MIN : minWeight - WEIGHT_STEP;
    } else if (afterWeight !== null && beforeWeight === null) {
      beforeWeight = await this.getMinWeightMoreThan(accountId, afterWeight);
      if (beforeWeight === null) {
        return afterWeight + WEIGHT_STEP;
      }
    } else if (afterWeight === null && beforeWeight !== null) {
      afterWeight = await this.getMaxWeightLessThan(accountId, beforeWeight);
      if (afterWeight === null) {
        return beforeWeight - WEIGHT_STEP;
      }
    }
    return (afterWeight + beforeWeight) / 2.0;
  }

  private async getMinWeightForAccount(accountId: number): Promise<number | null> {
    const result = await this.dataSource.query(
      `select min(at.weight) as weight from all_tasks at where at.account_id = ${accountId}`,
    );
    return result && result.length > 0 ? result[0].weight : null;
  }

  private async getWeightById(accountId: number, id: number): Promise<number | null> {
    const result = await this.dataSource.query(
      `select at.weight from all_tasks at where at.account_id = ${accountId} and at.id = ${id};`,
    );
    return result && result.length > 0 ? result[0].weight : null;
  }

  private async getMinWeightMoreThan(accountId: number, limitWeight: number): Promise<number | null> {
    const result = await this.dataSource.query(
      // eslint-disable-next-line max-len
      `select min(at.weight) as weight from all_tasks at where at.account_id = ${accountId} and at.weight > ${limitWeight}`,
    );
    return result && result.length > 0 ? result[0].weight : null;
  }

  private async getMaxWeightLessThan(accountId: number, limitWeight: number): Promise<number | null> {
    const result = await this.dataSource.query(
      // eslint-disable-next-line max-len
      `select max(at.weight) as weight from all_tasks at where at.account_id = ${accountId} and at.weight < ${limitWeight}`,
    );
    return result && result.length > 0 ? result[0].weight : null;
  }
}

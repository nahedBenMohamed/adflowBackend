import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SequenceIdService {
  constructor(private dataSource: DataSource) {}

  async nextIdentity(sequenceName: string): Promise<number> {
    const res = await this.dataSource.query(`select nextval('${sequenceName}')`);

    return parseInt(res[0]['nextval']);
  }

  public async getIdentityPool(sequenceName: string, size: number): Promise<number[]> {
    const res = await this.dataSource.query(`select nextval('${sequenceName}') from generate_series(1, ${size})`);
    return res.map((value) => parseInt(value.nextval));
  }
}

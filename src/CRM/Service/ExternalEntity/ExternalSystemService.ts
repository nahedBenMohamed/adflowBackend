import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository } from 'typeorm';

import { ExternalSystem } from '../../Model/ExternalEntity/ExternalSystem';

@Injectable()
export class ExternalSystemService {
  constructor(
    @InjectRepository(ExternalSystem)
    private readonly repository: Repository<ExternalSystem>,
  ) {}

  public async getById(id: number): Promise<ExternalSystem> {
    return await this.repository.findOneBy({ id });
  }

  public async getMatched(url: string): Promise<ExternalSystem | null> {
    const { hostname } = new URL(url);
    const host = hostname.split('.').slice(-2).join('.');
    return await this.repository.findOneBy({ urlTemplates: ArrayContains([host]) });
  }
}

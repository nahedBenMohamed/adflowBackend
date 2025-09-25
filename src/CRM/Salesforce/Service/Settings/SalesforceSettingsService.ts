import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SalesforceSettings } from '../../Model/Settings/SalesforceSettings';
import { CreateSalesforceSettingsDto } from './CreateSalesforceSettingsDto';

@Injectable()
export class SalesforceSettingsService {
  constructor(
    @InjectRepository(SalesforceSettings)
    private readonly repository: Repository<SalesforceSettings>,
  ) {}

  public async create(accountId: number, dto: CreateSalesforceSettingsDto): Promise<SalesforceSettings> {
    return await this.repository.save(new SalesforceSettings(accountId, dto.domain, dto.key, dto.secret));
  }

  public async getAll(accountId: number): Promise<SalesforceSettings[]> {
    return await this.repository.findBy({ accountId });
  }

  public async delete(accountId: number, id: string) {
    await this.repository.delete({ accountId, id });
  }
}

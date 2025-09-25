import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FrontendRoute, UrlGeneratorService } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';

import { EntityService } from '../Entity/EntityService';
import { ExternalSystemService } from './ExternalSystemService';

import { ExternalEntity } from '../../Model/ExternalEntity/ExternalEntity';
import { ExternalSystem } from '../../Model/ExternalEntity/ExternalSystem';
import { ExternalSystemCode } from '../../Model/ExternalEntity/ExternalSystemCode';

import { SalesforceIntegrationService } from '../../Salesforce/Service/SalesforceIntegrationService';

import { CreateExternalEntityDto } from './CreateExternalEntityDto';
import { CreateExternalEntityResult } from './CreateExternalEntityResult';

@Injectable()
export class ExternalEntityService {
  constructor(
    @InjectRepository(ExternalEntity)
    private readonly repository: Repository<ExternalEntity>,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly externalSystemService: ExternalSystemService,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly salesforceIntegrationService: SalesforceIntegrationService,
  ) {}

  public async create(account: Account, user: User, dto: CreateExternalEntityDto): Promise<CreateExternalEntityResult> {
    const [entity] = await this.entityService.createSimple({ accountId: account.id, user, dto });

    const entityUrl = this.urlGenerator.createUrl({
      route: FrontendRoute.entity.card({ entityTypeId: dto.entityTypeId, entityId: entity.id }),
      subdomain: account.subdomain,
    });

    const externalSystem = await this.externalSystemService.getMatched(dto.url);
    const data =
      externalSystem?.code === ExternalSystemCode.SalesForce
        ? await this.salesforceIntegrationService.getDataFromUrl(account.id, dto.url, entityUrl)
        : null;
    await this.repository.save(
      new ExternalEntity(account.id, entity.id, dto.url, externalSystem?.id, data?.rawData, data?.uiData),
    );

    return new CreateExternalEntityResult(entityUrl);
  }

  public async getExternalEntitiesWithType(
    entityId: number,
  ): Promise<{ externalEntity: ExternalEntity; type: ExternalSystem }[]> {
    const entities = await this.repository.findBy({ entityId });
    const result = [];
    for (const entity of entities) {
      const type = entity.system ? await this.externalSystemService.getById(entity.system) : null;
      result.push({ externalEntity: entity, type });
    }
    return result;
  }
}

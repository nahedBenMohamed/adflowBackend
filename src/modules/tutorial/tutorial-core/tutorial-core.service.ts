import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { AccountCreatedEvent, IamEventType } from '@/modules/iam/common';

import { TutorialConfig } from '../config/tutorial.config';
import { TutorialProductType } from '../common';
import { TutorialGroupService } from '../tutorial-group';
import { TutorialItemService } from '../tutorial-item';

import { DefaultTutorial } from './tutorial-defaults';

interface FindFilter {
  userId?: number;
  productType?: TutorialProductType;
  objectId?: number;
  createdFrom?: Date;
}

@Injectable()
export class TutorialCoreService {
  private _language: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly groupService: TutorialGroupService,
    private readonly itemService: TutorialItemService,
  ) {
    this._language = this.configService.get<TutorialConfig>('tutorial')?.language;
  }

  @OnEvent(IamEventType.AccountCreated, { async: true })
  public async handleRegistrationEvent(event: AccountCreatedEvent) {
    await this.createDefault(event.accountId);
  }

  public async count(accountId: number, filter?: FindFilter): Promise<number> {
    return this.itemService.count(accountId, filter);
  }

  private async createDefault(accountId: number): Promise<void> {
    if (this._language) {
      const groups = DefaultTutorial[this._language];
      if (groups) {
        for (const group of groups) {
          const createdGroup = await this.groupService.create(accountId, group);
          for (const item of group.items) {
            await this.itemService.create(accountId, createdGroup.id, item);
          }
        }
      }
    }
  }
}

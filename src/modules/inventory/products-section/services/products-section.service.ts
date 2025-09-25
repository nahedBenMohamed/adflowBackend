import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { ScheduleService } from '@/modules/scheduler/schedule/services/schedule.service';

import { ProductsEventType, ProductsSectionEvent } from '../../common';
import { OrderService } from '../../order/services/order.service';
import { RentalOrderService } from '../../rental-order/services/rental-order.service';

import { CreateProductsSectionDto, UpdateProductsSectionDto, LinkModulesDto } from '../dto';
import { ProductsSection, ProductsSectionEntityType } from '../entities';
import { ProductsSectionLinkerService } from './products-section-linker.service';

@Injectable()
export class ProductsSectionService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(ProductsSection)
    private readonly repository: Repository<ProductsSection>,
    private readonly authService: AuthorizationService,
    private readonly linkerService: ProductsSectionLinkerService,
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => RentalOrderService))
    private readonly rentalOrderService: RentalOrderService,
    @Inject(forwardRef(() => ScheduleService))
    private readonly scheduleService: ScheduleService,
  ) {}

  public async create(accountId: number, dto: CreateProductsSectionDto): Promise<ProductsSection> {
    const section = await this.repository.save(ProductsSection.fromDto(accountId, dto));

    this.eventEmitter.emit(
      ProductsEventType.ProductsSectionCreated,
      new ProductsSectionEvent({ accountId, sectionId: section.id }),
    );

    return section;
  }

  public async getAllFull(accountId: number, user: User): Promise<ProductsSection[]> {
    const sections = await this.repository
      .createQueryBuilder('ps')
      .where('ps.account_id = :accountId', { accountId })
      .leftJoinAndMapMany('ps.links', ProductsSectionEntityType, 'link', 'link.section_id = ps.id')
      .orderBy('ps.created_at', 'ASC')
      .getMany();

    const allowedSections: ProductsSection[] = [];
    for (const section of sections) {
      if (
        await this.authService.check({
          action: 'view',
          user,
          authorizable: ProductsSection.getAuthorizable(section.id),
        })
      ) {
        section.schedulerIds = await this.scheduleService.getLinkedSchedulerIds(accountId, {
          productsSectionId: section.id,
        });
        allowedSections.push(section);
      }
    }

    return allowedSections;
  }

  public async getOneFull(accountId: number, user: User, sectionId: number): Promise<ProductsSection> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: ProductsSection.getAuthorizable(sectionId),
      throwError: true,
    });

    const section = await this.repository
      .createQueryBuilder('ps')
      .where('ps.account_id = :accountId', { accountId })
      .andWhere('ps.id = :id', { id: sectionId })
      .leftJoinAndMapMany('ps.links', ProductsSectionEntityType, 'link', 'link.section_id = ps.id')
      .getOneOrFail();

    section.schedulerIds = await this.scheduleService.getLinkedSchedulerIds(accountId, {
      productsSectionId: sectionId,
    });

    return section;
  }

  private async getOne(accountId: number, sectionId: number): Promise<ProductsSection> {
    return await this.repository
      .createQueryBuilder('ps')
      .where('ps.account_id = :accountId', { accountId })
      .andWhere('ps.id = :id', { id: sectionId })
      .getOneOrFail();
  }

  public async update(
    accountId: number,
    user: User,
    sectionId: number,
    dto: UpdateProductsSectionDto,
  ): Promise<ProductsSection> {
    const section = await this.getOne(accountId, sectionId);
    await this.repository.save(section.update(dto));

    return this.getOneFull(accountId, user, sectionId);
  }

  public async delete(accountId: number, user: User, sectionId: number): Promise<boolean> {
    await this.orderService.delete(accountId, { sectionId });
    await this.rentalOrderService.delete(accountId, user, { sectionId });

    const result = await this.repository.delete({ accountId, id: sectionId });

    this.eventEmitter.emit(
      ProductsEventType.ProductsSectionDeleted,
      new ProductsSectionEvent({ accountId, sectionId }),
    );

    return result.affected > 0;
  }

  public async link(accountId: number, sectionId: number, dto: LinkModulesDto): Promise<boolean> {
    if (dto.entityTypeIds) {
      await this.linkerService.linkSectionWithEntityTypes(accountId, sectionId, dto.entityTypeIds);
    }

    if (dto.schedulerIds) {
      await this.scheduleService.linkProductsSection(accountId, dto.schedulerIds, sectionId);
    }

    return true;
  }

  public async linkEntityTypes(accountId: number, sectionId: number, entityTypeIds: number[]): Promise<boolean> {
    await this.linkerService.linkSectionWithEntityTypes(accountId, sectionId, entityTypeIds);

    return true;
  }

  public async linkSections(accountId: number, entityTypeId: number, sectionIds: number[]): Promise<boolean> {
    await this.linkerService.linkEntityTypeWithSections(accountId, entityTypeId, sectionIds);

    return true;
  }

  public async getLinkedSectionIds(accountId: number, user: User, entityTypeId: number): Promise<number[]> {
    const sectionIds = await this.linkerService.getLinkedSectionIds(accountId, entityTypeId);

    const availableSectionIds: number[] = [];
    for (const sectionId of sectionIds) {
      if (
        await this.authService.check({ action: 'view', user, authorizable: ProductsSection.getAuthorizable(sectionId) })
      ) {
        availableSectionIds.push(sectionId);
      }
    }
    return availableSectionIds;
  }

  public async ensureLinked(accountId: number, sectionId: number, entityTypeId: number): Promise<void> {
    await this.linkerService.ensureLinked(accountId, sectionId, entityTypeId);
  }
}

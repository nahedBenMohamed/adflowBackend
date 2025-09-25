import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { DepartmentDeletedEvent, IamEventType } from '../common';
import { DepartmentSettingsService } from '../department-settings/department-settings.service';

import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { Department } from './entities';
import { ExpandableField } from './types';

const cacheKey = ({ accountId, departmentId }: { accountId: number; departmentId: number }) =>
  `Department:${accountId}:${departmentId}`;
const cacheParentKey = ({
  accountId,
  parentId,
  active = true,
}: {
  accountId: number;
  parentId: number | null;
  active?: boolean;
}) => `Department.parent:${accountId}:${parentId}:${active}`;

@Injectable()
export class DepartmentService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
    @Inject(forwardRef(() => DepartmentSettingsService))
    private readonly departmentSettingsService: DepartmentSettingsService,
  ) {}

  async create({ accountId, dto }: { accountId: number; dto: CreateDepartmentDto }): Promise<Department> {
    const department = await this.repository.save(Department.fromDto(accountId, dto));

    if (dto.settings) {
      department.settings = await this.departmentSettingsService.create({
        accountId,
        departmentId: department.id,
        dto: dto.settings,
      });
    }

    return department;
  }

  async getHierarchy({
    accountId,
    departmentId,
    expand = [],
  }: {
    accountId: number;
    departmentId?: number | null;
    expand?: ExpandableField[];
  }): Promise<Department[]> {
    const departments = await this.repository.find({
      where: { accountId, parentId: departmentId ?? IsNull(), isActive: true },
      order: { id: 'ASC' },
      cache: { id: cacheParentKey({ accountId, parentId: departmentId ?? null }), milliseconds: 15000 },
    });
    for (const department of departments) {
      department.subordinates = await this.getHierarchy({ accountId, departmentId: department.id, expand });
      if (expand.includes('settings')) {
        department.settings = await this.departmentSettingsService.findOne({ accountId, departmentId: department.id });
      }
    }
    return departments;
  }

  async getSubordinatesIds({
    accountId,
    departmentId,
    fromParent,
  }: {
    accountId: number;
    departmentId: number | null;
    fromParent?: boolean;
  }): Promise<number[]> {
    if (!departmentId) return [];

    let fromDepartmentId = departmentId;
    if (fromParent) {
      const department = await this.findOne({ accountId, departmentId });
      if (department?.parentId) fromDepartmentId = department.parentId;
    }

    const departmentIds: number[] = [fromDepartmentId];
    const subordinates = await this.repository.find({
      where: { accountId, parentId: fromDepartmentId, isActive: true },
      order: { id: 'ASC' },
      cache: { id: cacheParentKey({ accountId, parentId: fromDepartmentId }), milliseconds: 15000 },
    });
    for (const subordinate of subordinates) {
      const subordinateIds = await this.getSubordinatesIds({
        accountId,
        departmentId: subordinate.id,
        fromParent: false,
      });
      departmentIds.push(...subordinateIds);
    }
    return departmentIds;
  }

  async findOne({ accountId, departmentId }: { accountId: number; departmentId: number }): Promise<Department | null> {
    return await this.repository.findOne({
      where: { accountId, id: departmentId },
      cache: { id: cacheKey({ accountId, departmentId }), milliseconds: 15000 },
    });
  }

  async update({
    accountId,
    departmentId,
    dto,
  }: {
    accountId: number;
    departmentId: number;
    dto: UpdateDepartmentDto;
  }): Promise<Department> {
    const department = await this.repository.findOneBy({ accountId, id: departmentId });
    await this.repository.save(department.update(dto));

    department.subordinates = await this.getHierarchy({ accountId, departmentId: department.id, expand: ['settings'] });
    department.settings = dto.settings
      ? await this.departmentSettingsService.update({ accountId, departmentId, dto: dto.settings })
      : await this.departmentSettingsService.findOne({ accountId, departmentId: department.id });

    return department;
  }

  /**
   * Delete department and it subordinates.
   * @param accountId accountId
   * @param departmentId departmentId
   */
  async delete({ accountId, departmentId }: { accountId: number; departmentId: number }) {
    const subordinates = await this.repository.findBy({ accountId, parentId: departmentId });
    for (const subordinate of subordinates) {
      await this.delete({ accountId, departmentId: subordinate.id });
    }
    await this.repository.delete(departmentId);
  }

  /**
   * Mark department and it subordinates as inactive.
   * @param accountId accountId
   * @param departmentId departmentId
   * @param newDepartmentId newDepartmentId
   */
  async softDelete({
    accountId,
    departmentId,
    newDepartmentId,
  }: {
    accountId: number;
    departmentId: number;
    newDepartmentId?: number;
  }) {
    const subordinates = await this.repository.findBy({ accountId, parentId: departmentId });
    for (const subordinate of subordinates) {
      await this.softDelete({ accountId, departmentId: subordinate.id, newDepartmentId });
    }
    await this.repository.update({ accountId, id: departmentId }, { isActive: false });

    this.eventEmitter.emit(
      IamEventType.DepartmentDeleted,
      new DepartmentDeletedEvent({ accountId, departmentId, newDepartmentId }),
    );
  }
}

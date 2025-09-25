import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DepartmentService } from '../department/department.service';
import { CreateDepartmentSettingsDto, UpdateDepartmentSettingsDto } from './dto';
import { DepartmentSettings } from './entities';

interface FindFilter {
  accountId: number;
  departmentId: number;
}
interface FindOptions {
  applyParent?: boolean;
}

const cacheKey = ({ accountId, departmentId }: { accountId: number; departmentId: number }) =>
  `DepartmentSettings:${accountId}:${departmentId}`;

@Injectable()
export class DepartmentSettingsService {
  constructor(
    @InjectRepository(DepartmentSettings)
    private readonly repository: Repository<DepartmentSettings>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentService: DepartmentService,
  ) {}

  public async create({
    accountId,
    departmentId,
    dto,
  }: {
    accountId: number;
    departmentId: number;
    dto: CreateDepartmentSettingsDto;
  }): Promise<DepartmentSettings> {
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, departmentId })]);
    return this.repository.save(DepartmentSettings.fromDto(accountId, departmentId, dto));
  }

  public async findOne(filter: FindFilter, option?: FindOptions): Promise<DepartmentSettings | null> {
    const settings = await this.repository.findOne({
      where: { accountId: filter.accountId, departmentId: filter.departmentId },
      cache: { id: cacheKey(filter), milliseconds: 86400000 },
    });
    if (!settings && option?.applyParent) {
      const department = await this.departmentService.findOne({
        accountId: filter.accountId,
        departmentId: filter.departmentId,
      });
      if (department?.parentId) {
        return this.findOne({ accountId: filter.accountId, departmentId: department.parentId }, option);
      }
    }
    return settings;
  }

  public async update({
    accountId,
    departmentId,
    dto,
  }: {
    accountId: number;
    departmentId: number;
    dto: UpdateDepartmentSettingsDto;
  }): Promise<DepartmentSettings> {
    const current = await this.findOne({ accountId, departmentId });
    if (current) {
      this.dataSource.queryResultCache?.remove([cacheKey({ accountId, departmentId })]);
      await this.repository.save(current.update(dto));

      return current;
    } else {
      return this.create({ accountId, departmentId, dto });
    }
  }

  public async delete({ accountId, departmentId }: { accountId: number; departmentId: number }) {
    this.dataSource.queryResultCache?.remove([cacheKey({ accountId, departmentId })]);
    await this.repository.delete({ accountId, departmentId });
  }
}

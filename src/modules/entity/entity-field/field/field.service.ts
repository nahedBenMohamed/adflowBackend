import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'mathjs';

import { ObjectState } from '@/common';
import { SequenceIdService } from '@/database';

import { SequenceName } from '@/CRM/common/enums/sequence-name.enum';

import { FieldEvent, FieldEventType, FieldType, FieldTypes, FormulaUtil } from '../common';
import { FieldOptionService } from '../field-option';

import { FieldCode, EditableFieldCodes } from './enums';
import { DuplicateFieldNameError, FieldUsedInFormulaError, FormulaCircularDependencyError } from './errors';
import { CreateFieldDto, UpdateFieldDto } from './dto';
import { ExpandableField } from './types';
import { Field } from './entities';

interface CreateOptions {
  skipProcessing?: boolean;
}

interface FindFilter {
  accountId: number;
  id?: number | number[];
  entityTypeId?: number | number[];
  type?: FieldType | FieldType[];
  code?: string;
  name?: string;
  value?: string;
  excludeId?: number | number[];
  excludeEntityTypeId?: number | number[];
}
interface FindOptions {
  expand?: ExpandableField[];
}

@Injectable()
export class FieldService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Field)
    private readonly repository: Repository<Field>,
    private readonly sequenceIdService: SequenceIdService,
    private readonly fieldOptionService: FieldOptionService,
  ) {}

  private async nextIdentity(): Promise<number> {
    return this.sequenceIdService.nextIdentity(SequenceName.Field);
  }

  async create({
    accountId,
    entityTypeId,
    dto,
    options,
  }: {
    accountId: number;
    entityTypeId: number;
    dto: CreateFieldDto;
    options?: CreateOptions;
  }): Promise<Field> {
    dto.id = dto.id ?? (await this.nextIdentity());

    if (!options?.skipProcessing && FieldTypes.formula.includes(dto.type)) {
      if (await this.hasCircularDependency({ accountId, entityTypeId, fieldId: dto.id, value: dto.value })) {
        throw new FormulaCircularDependencyError(dto.id);
      }
    }

    if (await this.hasDuplicateName({ accountId, entityTypeId, name: dto.name })) {
      throw new DuplicateFieldNameError(dto.name);
    }

    const field = await this.repository.save(Field.fromDto(accountId, entityTypeId, dto));

    if (dto.options) {
      field.options = await this.fieldOptionService.createMany({ accountId, fieldId: dto.id, dtos: dto.options });
    }

    if (!options?.skipProcessing) {
      this.eventEmitter.emit(
        FieldEventType.FieldCreated,
        new FieldEvent({ accountId, entityTypeId, fieldId: field.id, type: field.type }),
      );
    }

    return field;
  }
  async createMany({
    accountId,
    entityTypeId,
    dtos,
    options,
  }: {
    accountId: number;
    entityTypeId: number;
    dtos: CreateFieldDto[];
    options?: CreateOptions;
  }): Promise<Field[]> {
    return Promise.all(dtos.map((dto) => this.create({ accountId, entityTypeId, dto, options })));
  }

  async findOne(filter: FindFilter, options?: FindOptions): Promise<Field | null> {
    const field = await this.createFindQb(filter).getOne();

    return field && options?.expand
      ? await this.expandOne({ accountId: filter.accountId, field, expand: options.expand })
      : field;
  }

  async findMany(filter: FindFilter, options?: FindOptions): Promise<Field[]> {
    const fields = await this.createFindQb(filter).orderBy('sort_order', 'ASC').getMany();

    return fields && options?.expand
      ? await this.expandMany({ accountId: filter.accountId, fields, expand: options.expand })
      : fields;
  }

  async findManyIds(filter: FindFilter): Promise<number[]> {
    const fields = await this.createFindQb(filter)
      .select('id')
      .orderBy('sort_order', 'ASC')
      .getRawMany<{ id: number }>();

    return fields.map((field) => field.id);
  }

  async getCount(filter: FindFilter): Promise<number> {
    return this.createFindQb(filter).getCount();
  }

  async hasPriceField({ accountId, entityTypeId }: { accountId: number; entityTypeId: number }): Promise<boolean> {
    const count = await this.getCount({ accountId, entityTypeId, type: FieldType.Value });

    return count > 0;
  }

  async checkFormula({
    accountId,
    entityTypeId,
    fieldId,
    formula,
  }: {
    accountId: number;
    entityTypeId: number;
    fieldId: number;
    formula: string;
  }): Promise<boolean> {
    if (!formula) {
      return true;
    }

    try {
      parse(formula);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }

    if (await this.hasCircularDependency({ accountId, entityTypeId, fieldId, value: formula })) {
      throw new FormulaCircularDependencyError(fieldId);
    }

    return true;
  }

  async checkFormulaUsageField({ accountId, fieldId }: { accountId: number; fieldId: number }): Promise<boolean> {
    return (await this.getCount({ accountId, type: FieldTypes.formula, value: `f${fieldId}` })) > 0;
  }
  async checkFormulaUsageEntityType({
    accountId,
    entityTypeId,
    checkEntityTypeId,
    excludeEntityTypeId,
  }: {
    accountId: number;
    entityTypeId?: number;
    checkEntityTypeId: number;
    excludeEntityTypeId?: number;
  }): Promise<boolean> {
    return (
      (await this.getCount({
        accountId,
        type: FieldTypes.formula,
        entityTypeId,
        excludeEntityTypeId,
        value: `et${checkEntityTypeId}`,
      })) > 0
    );
  }

  private async hasDuplicateName({
    accountId,
    entityTypeId,
    name,
    id,
  }: {
    accountId: number;
    entityTypeId: number;
    name: string;
    id?: number;
  }): Promise<boolean> {
    return (await this.createFindQb({ accountId, entityTypeId, name, excludeId: id }).getCount()) > 0;
  }

  async update({
    accountId,
    entityTypeId,
    fieldId,
    dto,
    options,
  }: {
    accountId: number;
    entityTypeId: number;
    fieldId: number;
    dto: UpdateFieldDto;
    options?: CreateOptions;
  }): Promise<Field> {
    if (dto.value && !options?.skipProcessing && FieldTypes.formula.includes(dto.type)) {
      if (await this.hasCircularDependency({ accountId, entityTypeId, fieldId, value: dto.value })) {
        throw new FormulaCircularDependencyError(fieldId);
      }
    }

    if (dto.name && (await this.hasDuplicateName({ accountId, entityTypeId, name: dto.name, id: fieldId }))) {
      throw new DuplicateFieldNameError(dto.name);
    }

    const field = await this.findOne({ accountId, id: fieldId });
    await this.repository.save(field.update(dto));

    if (dto.options) {
      field.options = await this.fieldOptionService.processBatch({ accountId, fieldId, dtos: dto.options });
    }

    if (!options?.skipProcessing) {
      this.eventEmitter.emit(
        FieldEventType.FieldUpdated,
        new FieldEvent({ accountId, entityTypeId, fieldId: field.id, type: field.type }),
      );
    }

    return field;
  }

  async updateBatch({
    accountId,
    entityTypeId,
    dtos,
  }: {
    accountId: number;
    entityTypeId: number;
    dtos: UpdateFieldDto[];
  }): Promise<Field[]> {
    const fields: Field[] = [];

    for (const dto of dtos) {
      switch (dto.state) {
        case ObjectState.Created:
          fields.push(await this.create({ accountId, entityTypeId, dto: dto as CreateFieldDto }));
          break;
        case ObjectState.Updated:
          fields.push(await this.update({ accountId, entityTypeId, fieldId: dto.id, dto }));
          break;
        case ObjectState.Deleted:
          await this.delete({ accountId, entityTypeId, fieldId: dto.id });
          break;
      }
    }

    return fields;
  }

  private async delete({
    accountId,
    entityTypeId,
    fieldId,
  }: {
    accountId: number;
    entityTypeId: number;
    fieldId: number;
  }): Promise<void> {
    if (await this.checkFormulaUsageField({ accountId, fieldId })) {
      throw new FieldUsedInFormulaError(fieldId);
    }
    await this.repository.delete({ id: fieldId, accountId, entityTypeId });
    this.eventEmitter.emit(FieldEventType.FieldDeleted, new FieldEvent({ accountId, entityTypeId, fieldId }));
  }

  async updateFieldsSettings({
    accountId,
    entityTypeId,
    activeFieldCodes,
  }: {
    accountId: number;
    entityTypeId: number;
    activeFieldCodes: FieldCode[];
  }) {
    for (const code of EditableFieldCodes) {
      const field = await this.findOne({ accountId, entityTypeId, code: code });
      if (field) {
        await this.repository.update({ accountId, id: field.id }, { active: activeFieldCodes.includes(code) });
      }
    }
  }

  private createFindQb(filter: FindFilter) {
    const qb = this.repository.createQueryBuilder().where('account_id = :accountId', { accountId: filter.accountId });
    if (filter?.id) {
      if (Array.isArray(filter.id)) {
        qb.andWhere('id IN (:...ids)', { ids: filter.id });
      } else {
        qb.andWhere('id = :id', { id: filter.id });
      }
    }
    if (filter?.entityTypeId) {
      if (Array.isArray(filter.entityTypeId)) {
        qb.andWhere('entity_type_id IN (:...entityTypeIds)', { entityTypeIds: filter.entityTypeId });
      } else {
        qb.andWhere('entity_type_id = :entityTypeId', { entityTypeId: filter.entityTypeId });
      }
    }
    if (filter?.excludeEntityTypeId) {
      if (Array.isArray(filter.excludeEntityTypeId)) {
        qb.andWhere('entity_type_id NOT IN (:...excludeEntityTypeIds)', {
          excludeEntityTypeIds: filter.excludeEntityTypeId,
        });
      } else {
        qb.andWhere('entity_type_id != :excludeEntityTypeId', { excludeEntityTypeId: filter.excludeEntityTypeId });
      }
    }
    if (filter?.type) {
      if (Array.isArray(filter.type)) {
        qb.andWhere('type IN (:...types)', { types: filter.type });
      } else {
        qb.andWhere('type = :type', { type: filter.type });
      }
    }
    if (filter?.code) {
      qb.andWhere('code = :code', { code: filter.code });
    }
    if (filter?.name) {
      qb.andWhere('name = :name', { name: filter.name });
    }
    if (filter?.value) {
      qb.andWhere('value ilike :value', { value: `%${filter.value}%` });
    }

    if (filter?.excludeId) {
      if (Array.isArray(filter.excludeId)) {
        if (filter.excludeId.length) {
          qb.andWhere('id NOT IN (:...excludeIds)', { excludeIds: filter.excludeId });
        }
      } else {
        qb.andWhere('id != :excludeId', { excludeId: filter.excludeId });
      }
    }
    return qb;
  }

  private async expandOne({
    accountId,
    field,
    expand,
  }: {
    accountId: number;
    field: Field;
    expand: ExpandableField[];
  }): Promise<Field> {
    if (expand.includes('options')) {
      field.options = await this.fieldOptionService.findMany({ accountId, fieldId: field.id });
    }
    return field;
  }
  private async expandMany({
    accountId,
    fields,
    expand,
  }: {
    accountId: number;
    fields: Field[];
    expand: ExpandableField[];
  }): Promise<Field[]> {
    return await Promise.all(fields.map((field) => this.expandOne({ accountId, field, expand })));
  }

  private async hasCircularDependency({
    accountId,
    entityTypeId,
    fieldId,
    value,
  }: {
    accountId: number;
    entityTypeId: number;
    fieldId: number;
    value: string | null;
  }): Promise<boolean> {
    const visit = async (etId: number, fId: number, formula: string, visited: string[]): Promise<boolean> => {
      const fieldKey = FormulaUtil.createFieldKey({ entityTypeId: etId, fieldId: fId });
      if (visited.includes(fieldKey)) {
        return true;
      }

      const formulaKeys = FormulaUtil.extractVariables(formula);
      for (const formulaKey of formulaKeys) {
        const { entityTypeId: formulaEtId, fieldId: formulaFId } = FormulaUtil.parseFieldKey(formulaKey);
        const field = await this.findOne({
          accountId,
          entityTypeId: formulaEtId,
          id: formulaFId,
          type: FieldTypes.formula,
        });
        if (field && (await visit(field.entityTypeId, field.id, field.value, [...visited, fieldKey]))) {
          return true;
        }
      }

      return false;
    };

    return await visit(entityTypeId, fieldId, value || '', []);
  }
}

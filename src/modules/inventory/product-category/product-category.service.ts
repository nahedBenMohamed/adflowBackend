import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { NotFoundError } from '@/common';

import { AuthorizationService } from '@/modules/iam/authorization/authorization.service';
import { User } from '@/modules/iam/user/entities/user.entity';

import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto';
import { ProductCategory } from './entities';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly repository: Repository<ProductCategory>,
    private readonly authService: AuthorizationService,
  ) {}

  public async create(
    accountId: number,
    user: User,
    sectionId: number,
    dto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    await this.authService.check({
      action: 'create',
      user,
      authorizable: ProductCategory.getAuthorizable(sectionId),
      throwError: true,
    });

    return await this.repository.save(ProductCategory.fromDto(accountId, sectionId, user.id, dto));
  }

  private async getOne(accountId: number, sectionId: number, categoryId: number): Promise<ProductCategory> {
    const category = await this.repository.findOneBy({ accountId, id: categoryId, sectionId });
    if (!category) {
      throw NotFoundError.withId(ProductCategory, categoryId);
    }

    return category;
  }

  public async getHierarchy(
    accountId: number,
    user: User,
    sectionId: number,
    categoryId: number | null = null,
  ): Promise<ProductCategory[]> {
    await this.authService.check({
      action: 'view',
      user,
      authorizable: ProductCategory.getAuthorizable(sectionId),
      throwError: true,
    });

    return await this.getCategories(accountId, sectionId, categoryId);
  }

  public async getCategories(
    accountId: number,
    sectionId: number,
    categoryId: number | null,
  ): Promise<ProductCategory[]> {
    const categories = await this.repository.find({
      where: { accountId, sectionId, parentId: categoryId ?? IsNull() },
      order: { id: 'ASC' },
    });

    for (const category of categories) {
      category.children = await this.getCategories(accountId, sectionId, category.id);
    }

    return categories;
  }

  public async getCategoriesFlat(
    accountId: number,
    sectionId: number,
    categoryId: number | null,
  ): Promise<ProductCategory[]> {
    const category = categoryId ? await this.getOne(accountId, sectionId, categoryId) : null;
    const flat: ProductCategory[] = category ? [category] : [];

    const categories = await this.getCategories(accountId, sectionId, categoryId);
    for (const category of categories) {
      flat.push(...this.flatCategory(category));
    }

    return flat;
  }

  private flatCategory(category: ProductCategory): ProductCategory[] {
    const flat: ProductCategory[] = [category];
    for (const child of category.children) {
      flat.push(...this.flatCategory(child));
    }
    return flat;
  }

  public async update(
    accountId: number,
    user: User,
    sectionId: number,
    categoryId: number,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = await this.getOne(accountId, sectionId, categoryId);
    await this.authService.check({ action: 'edit', user, authorizable: category, throwError: true });

    category.name = dto.name;
    await this.repository.save(category);

    category.children = await this.getHierarchy(accountId, user, sectionId, category.id);

    return category;
  }

  public async delete(
    accountId: number,
    user: User,
    sectionId: number,
    categoryId: number,
    newCategoryId: number | null,
  ): Promise<void> {
    await this.authService.check({
      action: 'delete',
      user,
      authorizable: ProductCategory.getAuthorizable(sectionId),
      throwError: true,
    });

    const children = await this.repository.findBy({ accountId, sectionId, parentId: categoryId });
    for (const child of children) {
      await this.delete(accountId, user, sectionId, child.id, newCategoryId);
    }

    await this.repository.delete(categoryId);
  }
}

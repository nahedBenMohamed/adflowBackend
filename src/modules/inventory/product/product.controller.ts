import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

import { DatePeriodDto, PagingQuery } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';
import { StorageFile } from '@/modules/storage/types/storage-file';
import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilesUploadRequest } from './dto/file-upload-request';
import { GetProductsResult } from './dto/get-products.result';
import { ProductDto } from './dto/product.dto';
import { ProductsFilter } from './dto/products-filter';
import { UpdateProductDto } from './dto/update-product.dto';

const ProductImageFile = {
  MaxSize: 5242880,
  Type: 'image/*',
};

@ApiTags('inventory/products')
@Controller('products/sections/:sectionId/products')
@JwtAuthorized({ prefetch: { account: true, user: true } })
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @ApiCreatedResponse({ description: 'Create product', type: ProductDto })
  @Post()
  public async create(
    @CurrentAuth() { account, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateProductDto,
  ): Promise<ProductDto> {
    return await this.service.create(account, user, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Get products', type: GetProductsResult })
  @Get()
  public async getMany(
    @CurrentAuth() { account, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Query() filter: ProductsFilter,
    @Query() paging: PagingQuery,
    @Query() period: DatePeriodDto,
  ): Promise<GetProductsResult> {
    return await this.service.getProducts(account, user, sectionId, filter, period, paging);
  }

  @ApiCreatedResponse({ description: 'Product', type: ProductDto })
  @Get('/:productId')
  public async getOne(
    @CurrentAuth() { account, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductDto> {
    return this.service.getDtoById(account, user, sectionId, productId);
  }

  @ApiCreatedResponse({ description: 'Product', type: ProductDto })
  @Put('/:productId')
  public async update(
    @CurrentAuth() { account, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDto> {
    return this.service.update(account, user, sectionId, productId, dto);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Photos to upload', type: FilesUploadRequest })
  @ApiCreatedResponse({ description: 'Uploaded product photos' })
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @Post('/:productId/photos')
  async upload(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: ProductImageFile.MaxSize }),
          new FileTypeValidator({ fileType: ProductImageFile.Type }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @CurrentAuth() { account, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<FileLinkDto[]> {
    return await this.service.uploadPhotos(account, user, sectionId, productId, StorageFile.fromMulterFiles(files));
  }

  @ApiCreatedResponse({ description: 'Delete product' })
  @Delete('/:productId')
  public async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<void> {
    await this.service.markDeleted(accountId, user, sectionId, productId);
  }
}

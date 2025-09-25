import { Body, Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { ProductStockDto, UpdateProductStocksDto } from './dto';
import { ProductStockService } from './product-stock.service';

@ApiTags('inventory/products/stocks')
@Controller('products/sections/:sectionId/products/:productId/stocks')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class StockController {
  constructor(private service: ProductStockService) {}

  @ApiOkResponse({ description: 'Update product stocks', type: [ProductStockDto] })
  @Put()
  public async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() { stocks }: UpdateProductStocksDto,
  ) {
    return this.service.update({ accountId, user, sectionId, productId, dtos: stocks });
  }
}

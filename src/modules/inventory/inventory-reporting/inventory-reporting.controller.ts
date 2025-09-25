import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { InventoryReportDto, InventoryReportFilterDto } from './dto';
import { InventoryReportingService } from './inventory-reporting.service';

@ApiTags('inventory/reporting')
@Controller('products/reporting')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class InventoryReportingController {
  constructor(private readonly service: InventoryReportingService) {}

  @ApiOperation({ summary: 'Get products general report', description: 'Get products general report' })
  @ApiBody({ type: InventoryReportFilterDto, required: true, description: 'Products general report filter' })
  @ApiOkResponse({ description: 'Products general report', type: InventoryReportDto })
  @Post('general')
  public async getReport(@CurrentAuth() { accountId, user }: AuthData, @Body() filter: InventoryReportFilterDto) {
    return this.service.getReport({ accountId, user, filter });
  }
}

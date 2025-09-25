import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { CurrentDiscountDto } from './dto';
import { SubscriptionDiscountService } from './subscription-discount.service';

@ApiTags('IAM/subscriptions')
@Controller('subscriptions/discount')
@TransformToDto()
export class PublicSubscriptionDiscountController {
  constructor(private readonly service: SubscriptionDiscountService) {}

  @ApiOperation({ summary: 'Get discount by date', description: 'Get discount by date' })
  @ApiParam({ name: 'date', type: Date, required: true, description: 'Date to check discount' })
  @ApiOkResponse({ description: 'Current account discount', type: CurrentDiscountDto })
  @Get('date')
  public async findOne(@Query('date') date: string) {
    if (!date) {
      return new BadRequestException();
    }

    return this.service.findByDate(new Date(date));
  }
}

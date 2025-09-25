import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { RentalIntervalService } from './rental-interval.service';
import { RentalInterval } from './entities/rental-interval.entity';
import { RentalIntervalDto } from './dto/rental-interval.dto';

@ApiTags('inventory/rental/interval')
@Controller('rental/sections/:sectionId/interval')
@JwtAuthorized()
@TransformToDto()
export class RentalIntervalController {
  constructor(private readonly service: RentalIntervalService) {}

  @ApiCreatedResponse({ description: 'Set product rental interval', type: RentalIntervalDto })
  @Post()
  public async setRentalInterval(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: RentalIntervalDto,
  ): Promise<RentalInterval> {
    return await this.service.setRentalInterval(accountId, sectionId, dto);
  }

  @ApiCreatedResponse({ description: 'Get product section rental interval', type: RentalIntervalDto })
  @Get()
  public async findRentalInterval(
    @CurrentAuth() { accountId }: AuthData,
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ): Promise<RentalInterval | null> {
    return await this.service.findRentalInterval(accountId, sectionId);
  }
}

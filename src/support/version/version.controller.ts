import { TransformToDto } from '@/common';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateVersionDto, VersionDto, CurrentVersionDto } from './dto';
import { VersionService } from './version.service';

@ApiTags('support/version')
@Controller('support/version')
@TransformToDto()
export class VersionController {
  constructor(private readonly service: VersionService) {}

  @ApiExcludeEndpoint(true)
  @ApiOperation({
    summary: 'Create frontend version',
  })
  @ApiBody({ type: CreateVersionDto, required: true, description: 'Data for creating frontend version' })
  @ApiCreatedResponse({ description: 'Created version item', type: VersionDto })
  @Post('frontend')
  async create(@Body() dto: CreateVersionDto) {
    return this.service.create(dto);
  }

  @ApiOperation({
    summary: 'Get latest frontend version',
    description: 'Latest frontend version will be return if it is greater than the current version, otherwise null',
  })
  @ApiParam({
    name: 'currentVersion',
    type: String,
    required: true,
    description: 'Current version of the frontend app, usually retrieved from the "version" property of package.json',
  })
  @ApiOkResponse({
    type: VersionDto,
    description: 'Latest frontend version or null if provided current version is greater than the latest version',
  })
  @Get('frontend/latest')
  async getLatest(@Query() dto: CurrentVersionDto) {
    return this.service.getLatest(dto);
  }
}

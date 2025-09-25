import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CreateFrontendObjectDto, FrontendObjectDto, FrontendObjectFilterDto } from './dto';
import { FrontendObjectService } from './frontend-object.service';

@ApiTags('frontend/objects')
@Controller('frontend/objects')
@JwtAuthorized()
@TransformToDto()
export class FrontendObjectController {
  constructor(private readonly service: FrontendObjectService) {}

  @ApiOperation({ summary: 'Get frontend object', description: 'Get frontend object by filter' })
  @ApiBody({ type: FrontendObjectFilterDto, required: true, description: 'Filter' })
  @ApiOkResponse({ type: FrontendObjectDto, description: 'Frontend object' })
  @Get()
  async findOne(@CurrentAuth() { accountId }: AuthData, @Body() filter: FrontendObjectFilterDto) {
    return this.service.findOne({ accountId, ...filter });
  }

  @ApiOperation({ summary: 'Get frontend object', description: 'Get frontend object by key' })
  @ApiParam({ name: 'key', required: true, type: String, description: 'Object key' })
  @ApiOkResponse({ type: FrontendObjectDto, description: 'Frontend object' })
  @Get(':key')
  async findOneByKey(@CurrentAuth() { accountId }: AuthData, @Param('key') key: string) {
    return this.service.findOne({ accountId, key });
  }

  @ApiOperation({ summary: 'Upsert frontend object', description: 'Upsert frontend object' })
  @ApiBody({ type: CreateFrontendObjectDto, required: true, description: 'Frontend object' })
  @ApiCreatedResponse({ type: FrontendObjectDto, description: 'Frontend object' })
  @Post()
  async upsert(@CurrentAuth() { accountId }: AuthData, @Body() obj: CreateFrontendObjectDto) {
    return this.service.upsert({ accountId, key: obj.key, value: obj.value });
  }

  @ApiOperation({ summary: 'Upsert frontend object', description: 'Upsert frontend object by key' })
  @ApiParam({ name: 'key', required: true, type: String, description: 'Object key' })
  @ApiBody({ type: Object, required: true, description: 'Object value' })
  @ApiCreatedResponse({ type: FrontendObjectDto, description: 'Frontend object' })
  @Post(':key')
  async upsertByKey(@CurrentAuth() { accountId }: AuthData, @Param('key') key: string, @Body() value: unknown) {
    return this.service.upsert({ accountId, key, value });
  }

  @ApiOperation({ summary: 'Delete frontend object', description: 'Delete frontend object by filter' })
  @ApiBody({ type: FrontendObjectFilterDto, required: true, description: 'Filter' })
  @ApiOkResponse()
  @Delete()
  async delete(@CurrentAuth() { accountId }: AuthData, @Body() filter: FrontendObjectFilterDto) {
    return this.service.delete({ accountId, ...filter });
  }

  @ApiOperation({ summary: 'Delete frontend object', description: 'Delete frontend object by key' })
  @ApiParam({ name: 'key', required: true, type: String, description: 'Object key' })
  @ApiOkResponse()
  @Delete(':key')
  async deleteByKey(@CurrentAuth() { accountId }: AuthData, @Param('key') key: string) {
    return this.service.delete({ accountId, key });
  }
}

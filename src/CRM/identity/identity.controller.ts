import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { SequenceName } from '../common';
import { IdentityPoolDto } from './dto';
import { IdentityService } from './identity.service';

@ApiTags('crm/identity')
@Controller('crm/identities')
@JwtAuthorized()
@TransformToDto()
export class IdentityController {
  constructor(private readonly service: IdentityService) {}

  @ApiOperation({ summary: 'Get all available identity pools', description: 'Get all available identity pools' })
  @ApiOkResponse({ type: [IdentityPoolDto], description: 'All available identity pools' })
  @Get('all')
  public async getAllIdentityPools(): Promise<IdentityPoolDto[]> {
    return await this.service.getMany();
  }

  @ApiOperation({ summary: 'Get identity pool for sequence name', description: 'Get identity pool for sequence name' })
  @ApiParam({ name: 'name', enum: SequenceName, description: 'Sequence name', required: true })
  @ApiOkResponse({ type: [Number], description: 'Identity pool values' })
  @Get(':name')
  public async getIdentityPool(@Param('name') name: SequenceName): Promise<number[]> {
    return await this.service.getOne(name);
  }
}

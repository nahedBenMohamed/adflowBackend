import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import { FeatureDto } from './dto';
import { FeatureService } from './feature.service';

@ApiTags('crm/features')
@Controller('crm/features')
@JwtAuthorized()
@TransformToDto()
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @ApiOperation({ summary: 'Get features', description: 'Get all features' })
  @ApiOkResponse({ description: 'Features', type: [FeatureDto] })
  @Get()
  public async getEnabled() {
    return this.service.getEnabled();
  }
}

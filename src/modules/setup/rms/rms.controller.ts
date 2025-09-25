import { Controller, Get } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { ApiAccessRequired } from '@/modules/iam/common/decorators/api-access-required.decorator';

import { IndustryService } from './services/industry.service';
import { IndustryDto } from './dto/industry.dto';

@ApiTags('setup/rms')
@Controller('/setup/rms')
@ApiAccessRequired()
export class RmsController {
  constructor(private readonly service: IndustryService) {}

  @ApiCreatedResponse({ description: 'Industries', type: [IndustryDto] })
  @Get('industries')
  public async getIndustries(): Promise<IndustryDto[]> {
    return await this.service.getIndustryDtos();
  }
}

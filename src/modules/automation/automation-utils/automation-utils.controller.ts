import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  AutomationDelayUtil,
  AutomationEntityCondition,
  AutomationFieldCondition,
  AutomatonConditionUtil,
} from '../common';

@ApiTags('automation/utils')
@Controller('util')
export class AutomationUtilController {
  @ApiOperation({ summary: 'Generate FEEL conditions for entity', description: 'Generate FEEL conditions for entity' })
  @ApiOkResponse({ description: 'Conditions in FEEL', type: String })
  @Post('conditions/entity')
  public async formatEntityConditions(@Body() condition: AutomationEntityCondition) {
    return AutomatonConditionUtil.formatEntityCondition(condition);
  }

  @ApiOperation({ summary: 'Generate FEEL conditions for fields', description: 'Generate FEEL conditions for fields' })
  @ApiOkResponse({ description: 'Conditions in FEEL', type: String })
  @Post('conditions/fields')
  public async formatFieldCondition(@Body() condition: AutomationFieldCondition) {
    return AutomatonConditionUtil.formatFieldCondition(condition);
  }

  @ApiOperation({ summary: 'Generate delay', description: 'Generate delay for seconds in ISO 8601:Duration' })
  @ApiQuery({ name: 'seconds', type: Number, required: false, description: 'Delay in seconds' })
  @ApiOkResponse({ description: 'Delay in FEEL', type: String })
  @Get('delay')
  public async formatDelay(@Query('seconds') seconds: string | undefined) {
    return AutomationDelayUtil.formatSeconds(seconds ? Number(seconds) : null);
  }
}

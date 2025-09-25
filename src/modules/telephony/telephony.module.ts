import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { VoximplantModule } from './voximplant/voximplant.module';

@Module({
  imports: [VoximplantModule, RouterModule.register([{ path: 'telephony/voximplant', module: VoximplantModule }])],
  exports: [VoximplantModule],
})
export class TelephonyModule {}

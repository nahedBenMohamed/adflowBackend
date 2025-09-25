import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import googleConfig from './google.config';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [ConfigModule.forFeature(googleConfig), CalendarModule],
})
export class GoogleModule {}

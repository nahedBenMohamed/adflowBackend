import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { IAMModule } from '@/modules/iam/iam.module';
import { AuthModule } from '../auth/auth.module';

import { GoogleCalendar, GoogleCalendarAccount, GoogleCalendarLinked } from './entities';
import { CalendarService } from './calendar.service';
import { CalendarHandler } from './calendar.handler';
import { CalendarEmitter } from './calendar.emitter';
import { CalendarController } from './calendar.controller';
import { PublicCalendarController } from './public-calendar.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleCalendarAccount, GoogleCalendar, GoogleCalendarLinked]),
    IAMModule,
    AuthModule,
    EntityInfoModule,
  ],
  providers: [CalendarService, CalendarHandler, CalendarEmitter],
  controllers: [PublicCalendarController, CalendarController],
})
export class CalendarModule {}

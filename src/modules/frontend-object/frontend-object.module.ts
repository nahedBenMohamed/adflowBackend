import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { FrontendObject } from './entities/frontend-object.entity';
import { FrontendObjectService } from './frontend-object.service';
import { FrontendObjectController } from './frontend-object.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FrontendObject]), IAMModule],
  providers: [FrontendObjectService],
  controllers: [FrontendObjectController],
})
export class FrontendObjectModule {}

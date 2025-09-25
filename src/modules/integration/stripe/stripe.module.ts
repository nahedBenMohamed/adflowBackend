import { Module } from '@nestjs/common';

import { IAMModule } from '@/modules/iam/iam.module';

import { StripeService } from './stripe.service';
import { PublicStripeController } from './public-stripe.controller';
import { StripeController } from './stripe.controller';

@Module({
  imports: [IAMModule],
  providers: [StripeService],
  controllers: [PublicStripeController, StripeController],
})
export class StripeModule {}

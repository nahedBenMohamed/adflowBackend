import { Module } from '@nestjs/common';
import { ConditionalModule } from '@nestjs/config';

import { AppsumoModule } from './appsumo/appsumo.module';
import { GoogleModule } from './google/google.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [AppsumoModule, GoogleModule, ConditionalModule.registerWhen(StripeModule, 'STRIPE_ENABLED')],
  exports: [AppsumoModule],
})
export class IntegrationModule {}

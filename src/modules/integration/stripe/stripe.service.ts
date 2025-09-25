import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { UrlGeneratorService, FrontendRoute, BadRequestError, DateUtil } from '@/common';

import { Account } from '@/modules/iam/account/entities/account.entity';
import { AccountSubscriptionService } from '@/modules/iam/account-subscription/account-subscription.service';

import { SubscriptionPlanDto, SubscriptionPriceDto, SubscriptionFeatureDto, SubscriptionOrderDto } from './dto';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;
  private stripeWebhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly subscriptionService: AccountSubscriptionService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET'), { apiVersion: '2025-02-24.acacia' });
    this.stripeWebhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
  }

  public async getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    const { data } = await this.stripe.products.list({ active: true, limit: 100 });
    const products = data.filter(
      (product) => product.metadata['site_code'] !== undefined || product.metadata['site_order'] !== undefined,
    );

    const plans: SubscriptionPlanDto[] = [];
    for (const product of products) {
      const prices = await this.stripe.prices.list({ product: product.id });
      const priceDtos: SubscriptionPriceDto[] = prices.data.map((price) => ({
        id: price.id,
        amount: price.unit_amount / 100.0,
        currency: price.currency,
        interval: price.recurring?.interval ?? 'one_time',
      }));
      const defaultPrice = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
      const userLimit = product.metadata['site_user_limit'] ? Number(product.metadata['site_user_limit']) : null;

      let featureDtos: SubscriptionFeatureDto[] = [];
      if (product.metadata['site_features']) {
        try {
          featureDtos = JSON.parse(product.metadata['site_features']) as SubscriptionFeatureDto[];
        } catch (e) {
          this.logger.error(`Error parsing Stripe features`, (e as Error)?.stack);
        }
      }

      const isDefault = !!product.metadata['site_default'];
      plans.push({
        id: product.id,
        code: product.metadata['site_code'],
        name: product.name,
        description: product.description,
        order: Number(product.metadata['site_order'] ?? 0),
        prices: priceDtos,
        defaultPriceId: defaultPrice,
        features: featureDtos,
        isDefault,
        userLimit,
      });
    }
    return plans;
  }

  public async getCheckoutUrl(account: Account, userId: number, dto: SubscriptionOrderDto): Promise<string> {
    const redirectUrl = this.urlGenerator.createUrl({
      route: FrontendRoute.settings.stripe(),
      subdomain: account.subdomain,
    });
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: dto.priceId ?? undefined,
            quantity: dto.priceId ? dto.numberOfUsers : 1,
            price_data: !dto.priceId
              ? {
                  currency: 'usd',
                  product: dto.productId,
                  unit_amount: dto.amount * 100,
                }
              : undefined,
          },
        ],
        discounts: dto.couponId ? [{ coupon: dto.couponId }] : undefined,
        mode: dto.priceId ? 'subscription' : 'payment',
        customer_creation: dto.priceId ? undefined : 'always',
        success_url: `${redirectUrl}/?success=true`,
        cancel_url: `${redirectUrl}/?canceled=true`,
        client_reference_id: account.id.toString(),
        metadata: { accountId: account.id, userId, numberOfUsers: dto.numberOfUsers },
      });
      return session.url;
    } catch (e) {
      this.logger.error(`Stripe checkout error`, (e as Error)?.stack);
      throw e;
    }
  }

  public async getCustomerPortalUrl(account: Account): Promise<string | null> {
    const subscription = await this.subscriptionService.get(account.id);
    if (!subscription.externalCustomerId) {
      return null;
    }

    const returnUrl = this.urlGenerator.createUrl({ route: FrontendRoute.settings.base, subdomain: account.subdomain });

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.externalCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  public async handleWebhook(body: unknown, rawBody: Buffer, signature: string | string[]): Promise<void> {
    let event: Stripe.Event;

    if (this.stripeWebhookSecret) {
      try {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, this.stripeWebhookSecret);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        throw new BadRequestError('Invalid stripe signature');
      }
    } else {
      event = body as Stripe.Event;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const fullSession = await this.stripe.checkout.sessions.retrieve(session.id, {
      expand: ['subscription.plan.product', 'line_items.data.price.product'],
    });

    const accountId = Number(fullSession.client_reference_id);
    const subscription = fullSession.subscription as Stripe.Subscription;
    const lineItem = fullSession.line_items?.data?.[0];
    const product = (
      subscription ? ((subscription['plan'] as Stripe.Plan)?.product as Stripe.Product) : lineItem?.price?.product
    ) as Stripe.Product;
    const quantity = Number(
      fullSession.metadata['numberOfUsers'] ?? subscription?.['quantity'] ?? lineItem?.quantity ?? 1,
    );
    const externalCustomerId = fullSession.customer as string;

    await this.updateSubscription({ accountId, product, subscription, externalCustomerId, quantity });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const fullSubscription = await this.stripe.subscriptions.retrieve(subscription.id, {
      expand: ['plan.product'],
    });

    const product = (fullSubscription['plan'] as Stripe.Plan)?.product as Stripe.Product;
    const quantity = Number(fullSubscription['quantity']);
    const externalCustomerId = fullSubscription.customer as string;

    await this.updateSubscription({ product, subscription: fullSubscription, externalCustomerId, quantity });
  }

  private async updateSubscription({
    accountId,
    product,
    subscription,
    externalCustomerId,
    quantity,
  }: {
    accountId?: number;
    product: Stripe.Product;
    subscription?: Stripe.Subscription;
    externalCustomerId: string;
    quantity: number;
  }) {
    const periodStart = DateUtil.startOf(
      subscription ? new Date(subscription.current_period_start * 1000) : DateUtil.now(),
      'day',
    );
    const periodEnd = DateUtil.endOf(
      subscription ? new Date(subscription.current_period_end * 1000) : DateUtil.add(DateUtil.now(), { years: 100 }),
      'day',
    );
    await this.subscriptionService.update(
      { accountId, externalCustomerId: !accountId ? externalCustomerId : undefined },
      null,
      {
        isTrial: false,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        userLimit: quantity,
        planName: product.name,
        externalCustomerId,
      },
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const stripeCustomerId = subscription.customer as string;
    await this.subscriptionService.cancel({ externalCustomerId: stripeCustomerId });
  }
}

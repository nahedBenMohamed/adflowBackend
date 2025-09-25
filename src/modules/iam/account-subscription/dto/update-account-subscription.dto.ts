export class UpdateAccountSubscriptionDto {
  isTrial?: boolean;
  periodStart?: string;
  periodEnd?: string;
  userLimit?: number;
  planName?: string;
  externalCustomerId?: string | null;
  firstVisit?: string;
}

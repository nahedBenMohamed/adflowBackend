export class CreateAccountSubscriptionDto {
  createdAt?: string;
  termInDays?: number;
  userLimit?: number;
  planName?: string;
  isTrial?: boolean;
  firstVisit?: string;
}

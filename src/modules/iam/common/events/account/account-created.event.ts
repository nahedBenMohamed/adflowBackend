export class AccountCreatedEvent {
  accountId: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  subdomain: string;
  ownerId: number;
  createdAt: string;
  subscriptionName: string;
  gaClientId: string | null;
  gaUserId: string | null;

  constructor({
    accountId,
    name,
    email,
    phone,
    companyName,
    subdomain,
    ownerId,
    createdAt,
    subscriptionName,
    gaClientId,
    gaUserId,
  }: AccountCreatedEvent) {
    this.accountId = accountId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.companyName = companyName;
    this.subdomain = subdomain;
    this.ownerId = ownerId;
    this.createdAt = createdAt;
    this.subscriptionName = subscriptionName;
    this.gaClientId = gaClientId;
    this.gaUserId = gaUserId;
  }
}

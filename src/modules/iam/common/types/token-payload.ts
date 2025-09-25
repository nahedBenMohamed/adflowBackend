export interface TokenPayload {
  accountId: number;
  subdomain: string;
  userId: number;
  isPartner?: boolean | null;
  code?: string | null;
}

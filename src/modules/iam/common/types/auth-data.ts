import { type Account } from '../../account/entities/account.entity';
import { type User } from '../../user/entities/user.entity';
import { type TokenPayload } from './token-payload';

export interface AuthData {
  accountId: number;
  userId: number;
  account: Account | null | undefined;
  user: User | null | undefined;
  token: TokenPayload;
}

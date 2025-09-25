import { UserAccessTokenDto } from '../dto';
import { UserToken } from '../entities';

export class UserAccessToken {
  accessToken: string;
  userToken: UserToken;

  constructor({ accessToken, userToken }: { accessToken: string; userToken: UserToken }) {
    this.accessToken = accessToken;
    this.userToken = userToken;
  }

  toDto(): UserAccessTokenDto {
    return {
      accessToken: this.accessToken,
      userToken: this.userToken.toDto(),
    };
  }
}

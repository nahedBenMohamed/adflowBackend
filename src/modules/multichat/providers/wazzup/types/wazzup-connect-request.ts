export class WazzupConnectRequest {
  state: string;
  secret: string;
  crmKey: string;
  name: string;

  constructor({ state, secret, crmKey, name }: WazzupConnectRequest) {
    this.state = state;
    this.secret = secret;
    this.crmKey = crmKey;
    this.name = name;
  }
}

import { type WazzupChannelDto } from '../dto';
import { type WazzupChannelState, type WazzupTransport } from '../enums';

export class WazzupChannel {
  channelId: string;
  transport: WazzupTransport;
  state: WazzupChannelState;
  plainId: string;
  name: string;

  public toDto(): WazzupChannelDto {
    return {
      channelId: this.channelId,
      transport: this.transport,
      state: this.state,
      plainId: this.plainId,
      name: this.name,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { WazzupChannelState, WazzupTransport } from '../enums';

export class WazzupChannelDto {
  @ApiProperty()
  @IsString()
  channelId: string;

  @ApiProperty({ enum: WazzupTransport })
  @IsEnum(WazzupTransport)
  transport: WazzupTransport;

  @ApiProperty({ enum: WazzupChannelState })
  @IsEnum(WazzupChannelState)
  state: WazzupChannelState;

  @ApiProperty()
  @IsString()
  plainId: string;

  @ApiProperty()
  @IsString()
  name: string;
}

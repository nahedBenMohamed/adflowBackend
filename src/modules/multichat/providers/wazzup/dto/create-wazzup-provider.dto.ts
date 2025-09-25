import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { CreateChatProviderDto } from '../../../chat-provider/dto';
import { WazzupTransport } from '../enums';

export class CreateWazzupProviderDto extends CreateChatProviderDto {
  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  channelId: string;

  @ApiProperty()
  @IsString()
  plainId: string;

  @ApiProperty({ enum: WazzupTransport })
  @IsEnum(WazzupTransport)
  channelTransport: WazzupTransport;
}

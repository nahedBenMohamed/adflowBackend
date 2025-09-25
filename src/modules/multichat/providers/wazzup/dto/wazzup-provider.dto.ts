import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ChatProviderDto } from '../../../chat-provider/dto';

export class WazzupProviderDto extends ChatProviderDto {
  @ApiProperty({ description: 'Channel ID' })
  @IsString()
  channelId: string;

  @ApiProperty({ description: 'Plain ID' })
  @IsString()
  plainId: string;
}

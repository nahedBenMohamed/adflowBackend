import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ChatProviderDto } from '../../../chat-provider/dto';

export class MessengerProviderDto extends ChatProviderDto {
  @ApiProperty({ description: 'Page id' })
  @IsString()
  pageId: string;

  @ApiProperty({ description: 'Page access token' })
  @IsString()
  pageAccessToken: string;
}

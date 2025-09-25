import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { CreateChatProviderDto } from '../../../chat-provider/dto';

export class CreateMessengerProviderDto extends CreateChatProviderDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'User access token' })
  @IsString()
  userAccessToken: string;

  @ApiProperty({ description: 'Page ID' })
  @IsString()
  pageId: string;

  @ApiProperty({ description: 'Page access token' })
  @IsString()
  pageAccessToken: string;
}

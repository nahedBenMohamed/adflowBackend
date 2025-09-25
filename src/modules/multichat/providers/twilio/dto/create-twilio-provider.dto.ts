import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { CreateChatProviderDto } from '../../../chat-provider/dto';

export class CreateTwilioProviderDto extends CreateChatProviderDto {
  @ApiProperty({ description: 'Twilio account SID' })
  @IsString()
  accountSid: string;

  @ApiProperty({ description: 'Twilio auth token' })
  @IsString()
  authToken: string;

  @ApiProperty({ description: 'Twilio phone number' })
  @IsString()
  phoneNumber: string;
}

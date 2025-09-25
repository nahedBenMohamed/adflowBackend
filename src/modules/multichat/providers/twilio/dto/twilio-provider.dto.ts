import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ChatProviderDto } from '../../../chat-provider/dto';

export class TwilioProviderDto extends ChatProviderDto {
  @ApiProperty({ description: 'Twilio account SID' })
  @IsString()
  accountSid: string;

  @ApiProperty({ description: 'Twilio phone number' })
  @IsString()
  phoneNumber: string;
}

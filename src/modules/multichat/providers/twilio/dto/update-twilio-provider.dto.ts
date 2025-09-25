import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { UpdateChatProviderDto } from '../../../chat-provider/dto';

export class UpdateTwilioProviderDto extends UpdateChatProviderDto {
  @ApiProperty({ description: 'Twilio account SID' })
  @IsString()
  accountSid: string;

  @ApiPropertyOptional({ description: 'Twilio auth token' })
  @IsOptional()
  @IsString()
  authToken?: string;

  @ApiProperty({ description: 'Twilio phone number' })
  @IsString()
  phoneNumber: string;
}

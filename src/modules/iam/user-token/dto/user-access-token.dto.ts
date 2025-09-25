import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { UserTokenDto } from './user-token.dto';

export class UserAccessTokenDto {
  @ApiProperty({ description: 'User access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'User token' })
  userToken: UserTokenDto;
}

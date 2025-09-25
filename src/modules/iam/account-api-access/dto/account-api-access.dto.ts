import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AccountApiAccessDto {
  @ApiProperty({ description: 'API key' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'Created at' })
  @IsString()
  createdAt: string;
}

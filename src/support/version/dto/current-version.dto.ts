import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CurrentVersionDto {
  @ApiProperty({ description: 'Current version of an app in x.x.x format, where x is a number' })
  @IsString()
  currentVersion: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FrontendObjectFilterDto {
  @ApiProperty({ description: 'Key of the frontend object' })
  @IsString()
  key: string;
}

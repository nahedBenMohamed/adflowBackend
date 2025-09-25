import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsString } from 'class-validator';

export class FrontendObjectDto {
  @ApiProperty({ description: 'Key of the frontend object' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Value of the frontend object', type: Object })
  @IsNotEmptyObject()
  value: unknown;

  @ApiProperty({ description: 'Date of creation' })
  @IsString()
  createdAt: string;
}

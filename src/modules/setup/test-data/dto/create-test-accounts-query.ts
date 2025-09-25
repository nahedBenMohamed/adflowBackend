import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateTestAccountsQuery {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsDateString()
  fromDate: string;

  @ApiProperty()
  @IsDateString()
  toDate: string;
}

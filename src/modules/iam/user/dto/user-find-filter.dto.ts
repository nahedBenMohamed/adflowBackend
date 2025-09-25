import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserFindFilterDto {
  @ApiPropertyOptional({ description: 'User full name, first name + last name, e.g. "John Doe"' })
  @IsOptional()
  @IsString()
  fullName?: string;
}

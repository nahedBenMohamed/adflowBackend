import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

import { CreateSimpleEntityDto } from '../Entity/Dto';

export class CreateExternalEntityDto extends CreateSimpleEntityDto {
  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}

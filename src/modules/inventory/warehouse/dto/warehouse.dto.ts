import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common';

export class WarehouseDto {
  @ApiProperty({ description: 'Warehouse ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Section ID' })
  @IsNumber()
  sectionId: number;

  @ApiProperty({ description: 'Warehouse name' })
  @IsString()
  name: string;

  @ApiProperty({ type: UserRights, description: 'User rights' })
  userRights: UserRights;
}

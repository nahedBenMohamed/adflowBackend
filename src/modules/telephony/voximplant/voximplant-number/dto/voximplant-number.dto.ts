import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class VoximplantNumberDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ nullable: true })
  @IsString()
  externalId: string | null;

  @ApiPropertyOptional({ type: [Number], nullable: true })
  @IsOptional()
  @IsArray()
  userIds?: number[] | null;

  constructor({ id, phoneNumber, externalId, userIds }: VoximplantNumberDto) {
    this.id = id;
    this.phoneNumber = phoneNumber;
    this.externalId = externalId;
    this.userIds = userIds;
  }
}

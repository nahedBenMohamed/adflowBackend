import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class VoximplantUserDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  constructor({ userId, userName, isActive }: VoximplantUserDto) {
    this.userId = userId;
    this.userName = userName;
    this.isActive = isActive;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

import { ChatUserRole } from '../../common';
import { ChatUserExternalDto } from './chat-user-external.dto';

export class ChatUserDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  userId: number | null;

  @ApiProperty({ enum: ChatUserRole })
  @IsEnum(ChatUserRole)
  role: ChatUserRole;

  @ApiProperty({ type: ChatUserExternalDto, nullable: true })
  @IsOptional()
  externalUser: ChatUserExternalDto | null;

  constructor({ id, userId, role, externalUser }: ChatUserDto) {
    this.id = id;
    this.userId = userId;
    this.role = role;
    this.externalUser = externalUser;
  }
}

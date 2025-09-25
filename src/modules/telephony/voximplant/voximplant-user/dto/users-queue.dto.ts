import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UsersQueueDto {
  @ApiPropertyOptional({ nullable: true, type: [String] })
  @IsOptional()
  @IsArray()
  users?: string[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  entityTypeId?: number | null;

  constructor({ users, entityName, entityId, entityTypeId }: UsersQueueDto) {
    this.users = users;
    this.entityName = entityName;
    this.entityId = entityId;
    this.entityTypeId = entityTypeId;
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { faker } from '@faker-js/faker';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { ChatDto } from '@/modules/multichat/chat/dto/chat.dto';
import { FieldValue } from '@/modules/entity/entity-field/field-value/entities/field-value.entity';
import { FieldValueDto } from '@/modules/entity/entity-field/field-value/dto/field-value.dto';

import { EntityLinkDto } from '../../../entity-link/dto';
import { Entity } from '../../../Model/Entity/Entity';
import { ExternalEntityDto } from '../../ExternalEntity/ExternalEntityDto';
import { ExternalEntity } from '../../../Model/ExternalEntity/ExternalEntity';
import { ExternalSystem } from '../../../Model/ExternalEntity/ExternalSystem';

export class EntityDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty()
  @IsNumber()
  responsibleUserId: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  boardId: number | null;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  stageId: number | null;

  @ApiProperty()
  @IsNumber()
  createdBy: number;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ description: 'Is focused?' })
  @IsOptional()
  @IsBoolean()
  focused?: boolean;

  @ApiProperty({ type: [FieldValueDto] })
  @IsArray()
  fieldValues: FieldValueDto[];

  @ApiProperty({ type: [EntityLinkDto] })
  @IsArray()
  entityLinks: EntityLinkDto[];

  @ApiProperty({ type: [ExternalEntityDto] })
  @IsArray()
  externalEntities: ExternalEntityDto[];

  @ApiProperty({ type: UserRights })
  @IsObject()
  userRights: UserRights;

  @ApiPropertyOptional()
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  updatedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  closedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  copiedFrom?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  copiedCount?: number | null;

  @ApiPropertyOptional({ type: [ChatDto], nullable: true })
  @IsOptional()
  chats?: ChatDto[] | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  lastShipmentDate?: string | null;

  constructor(
    id: number,
    name: string,
    entityTypeId: number,
    responsibleUserId: number,
    boardId: number | null,
    stageId: number | null,
    createdBy: number,
    weight: number,
    focused: boolean,
    fieldValues: FieldValueDto[],
    entityLinks: EntityLinkDto[],
    externalEntities: ExternalEntityDto[],
    userRights: UserRights,
    createdAt: string,
    updatedAt: string | null,
    closedAt: string | null,
    copiedFrom: number | null,
    copiedCount: number | null,
    chats: ChatDto[] | null,
    lastShipmentDate: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.entityTypeId = entityTypeId;
    this.responsibleUserId = responsibleUserId;
    this.boardId = boardId;
    this.stageId = stageId;
    this.createdBy = createdBy;
    this.weight = weight;
    this.focused = focused;
    this.fieldValues = fieldValues;
    this.entityLinks = entityLinks;
    this.externalEntities = externalEntities;
    this.userRights = userRights;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.closedAt = closedAt;
    this.copiedFrom = copiedFrom;
    this.copiedCount = copiedCount;
    this.chats = chats;
    this.lastShipmentDate = lastShipmentDate;
  }

  public static fromEntity(
    entity: Entity,
    fieldValues: FieldValue[],
    entityLinks: EntityLinkDto[],
    externalEntities: { externalEntity: ExternalEntity; type: ExternalSystem }[],
    userRights: UserRights,
    chats: ChatDto[] | null,
    lastShipmentDate: string | null,
  ) {
    const fieldValueDtos = fieldValues.map((fieldValue) => fieldValue.toDto());
    const externalEntitiesDtos = externalEntities.map((ee) => ExternalEntityDto.create(ee.externalEntity, ee.type));

    return new EntityDto(
      entity.id,
      entity.name,
      entity.entityTypeId,
      entity.responsibleUserId,
      entity.boardId,
      entity.stageId,
      entity.createdBy,
      entity.weight,
      entity.focused,
      fieldValueDtos,
      entityLinks,
      externalEntitiesDtos,
      userRights,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
      entity.closedAt?.toISOString() ?? null,
      entity.copiedFrom,
      entity.copiedCount,
      chats,
      lastShipmentDate,
    );
  }

  public static fake(): EntityDto {
    const closedAt = faker.date.past();
    return new EntityDto(
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.person.fullName(),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.float({ min: -1000000, max: 1000000 }),
      false,
      [],
      [],
      [],
      UserRights.full(),
      faker.date.past({ refDate: closedAt }).toISOString(),
      faker.date.past({ refDate: closedAt }).toISOString(),
      closedAt.toISOString(),
      faker.number.int({ min: 10000000, max: 99999999 }),
      faker.number.int({ min: 10000000, max: 99999999 }),
      [],
      faker.date.past({ refDate: closedAt }).toISOString(),
    );
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

import { UserRights } from '@/modules/iam/common/types/user-rights';
import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';
import { OrderDto } from '@/modules/inventory/order/dto/order.dto';

import { ScheduleAppointmentStatus } from '../../common';

export class ScheduleAppointmentDto {
  @ApiProperty({ description: 'Appointment ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Schedule ID' })
  @IsNumber()
  scheduleId: number;

  @ApiProperty({ description: 'Appointment start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Appointment end date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: ScheduleAppointmentStatus, description: 'Appointment status' })
  @IsEnum(ScheduleAppointmentStatus)
  status: ScheduleAppointmentStatus;

  @ApiPropertyOptional({ nullable: true, description: 'Appointment title' })
  @IsOptional()
  @IsString()
  title?: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Appointment comment' })
  @IsOptional()
  @IsString()
  comment?: string | null;

  @ApiProperty({ description: 'User ID for appointment owner' })
  @IsNumber()
  ownerId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Linked entity ID' })
  @IsOptional()
  @IsNumber()
  entityId?: number | null;

  @ApiPropertyOptional({ type: EntityInfoDto, nullable: true, description: 'Linked entity' })
  @IsOptional()
  entityInfo?: EntityInfoDto | null;

  @ApiProperty({ description: 'Performer ID' })
  @IsNumber()
  performerId: number;

  @ApiPropertyOptional({ nullable: true, description: 'Linked order ID' })
  @IsOptional()
  @IsNumber()
  orderId?: number | null;

  @ApiPropertyOptional({ type: OrderDto, nullable: true, description: 'Linked order' })
  @IsOptional()
  order?: OrderDto | null;

  @ApiPropertyOptional({ nullable: true, description: 'Previous appointment count' })
  @IsOptional()
  @IsNumber()
  prevAppointmentCount?: number | null;

  @ApiProperty({ description: 'Appointment creation date' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ type: () => UserRights, description: 'User rights for current user' })
  @IsObject()
  userRights: UserRights;

  @ApiPropertyOptional({ nullable: true, description: 'External ID' })
  @IsOptional()
  @IsString()
  externalId?: string | null;
}

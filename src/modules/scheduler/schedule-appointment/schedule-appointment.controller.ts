import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { TransformToDto, PagingQuery, ExpandQuery } from '@/common';

import { AuthData } from '@/modules/iam/common/types/auth-data';
import { CurrentAuth } from '@/modules/iam/common/decorators/current-auth.decorator';
import { JwtAuthorized } from '@/modules/iam/common/decorators/jwt-authorized.decorator';

import {
  ScheduleAppointmentDto,
  CreateScheduleAppointmentDto,
  ScheduleAppointmentResultDto,
  ScheduleAppointmentFilterDto,
  UpdateScheduleAppointmentDto,
  ScheduleAppointmentStatisticDto,
} from './dto';
import { EntityListItem, EntityListMeta } from '@/CRM/Service/Entity/Dto/List';
import { ExpandableField, Spot } from './types';
import { ScheduleAppointmentService } from './schedule-appointment.service';

@ApiTags('scheduler/appointment')
@Controller('appointments')
@JwtAuthorized({ prefetch: { user: true } })
@TransformToDto()
export class ScheduleAppointmentController {
  constructor(private readonly service: ScheduleAppointmentService) {}

  @ApiOperation({ summary: 'Create schedule appointment', description: 'Create schedule appointment' })
  @ApiBody({ description: 'Data for creating schedule appointment', type: CreateScheduleAppointmentDto })
  @ApiCreatedResponse({ description: 'Schedule appointment', type: ScheduleAppointmentDto })
  @Post()
  async create(@CurrentAuth() { accountId, user }: AuthData, @Body() dto: CreateScheduleAppointmentDto) {
    return this.service.create({ accountId, user, dto });
  }

  @ApiOperation({ summary: 'Get schedule appointments', description: 'Get schedule appointments according filter' })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: order,prevAppointmentCount,entityInfo.',
  })
  @ApiOkResponse({ description: 'Schedule appointments', type: ScheduleAppointmentResultDto })
  @Get()
  async getSchedule(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() filter: ScheduleAppointmentFilterDto,
    @Query() paging: PagingQuery,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.getSchedule({ accountId, user, filter, paging, options: { expand: expand.fields } });
  }

  @ApiOperation({
    summary: 'Get schedule appointment statistic',
    description: 'Get schedule appointment statistic according filter',
  })
  @ApiOkResponse({ description: 'Schedule appointment statistic', type: ScheduleAppointmentStatisticDto })
  @Get('statistic')
  async getStatistic(@CurrentAuth() { accountId }: AuthData, @Query() filter: ScheduleAppointmentFilterDto) {
    return this.service.getStatistic({ accountId, filter });
  }

  @ApiOperation({ summary: 'Get appointments count', description: 'Get appointments count according filter' })
  @ApiOkResponse({ description: 'Appointments count', type: Number })
  @Get('count')
  async getCount(@CurrentAuth() { accountId }: AuthData, @Query() filter: ScheduleAppointmentFilterDto) {
    return this.service.getCount({ accountId, filter, isSchedule: true });
  }

  @ApiOperation({
    summary: 'Get last schedule appointment',
    description: 'Get last schedule appointment according filter',
  })
  @ApiQuery({ name: 'filter', type: ScheduleAppointmentFilterDto, required: false, description: 'Filter' })
  @ApiOkResponse({ description: 'Schedule appointments', type: ScheduleAppointmentDto })
  @Get('last')
  async getLast(@CurrentAuth() { accountId, user }: AuthData, @Query() filter: ScheduleAppointmentFilterDto) {
    return this.service.getLast({ accountId, user, filter });
  }

  @ApiOperation({
    summary: 'Get schedule appointment linked cards',
    description: 'Get schedule appointment linked cards',
  })
  @ApiOkResponse({ description: 'Entity list linked with appointments', type: [EntityListItem] })
  @Get('cards/list')
  async getEntityList(
    @CurrentAuth() { accountId, user }: AuthData,
    @Query() filter: ScheduleAppointmentFilterDto,
    @Query() paging: PagingQuery,
  ): Promise<EntityListItem[]> {
    return this.service.getEntityList({ accountId, user, filter, paging });
  }

  @ApiOperation({
    summary: 'Get schedule appointment linked cards meta',
    description: 'Get schedule appointment linked cards meta',
  })
  @ApiOkResponse({ description: 'Meta for entity list', type: EntityListMeta })
  @Get('cards/list/meta')
  async getEntityListMeta(
    @CurrentAuth() { accountId }: AuthData,
    @Query() filter: ScheduleAppointmentFilterDto,
  ): Promise<EntityListMeta> {
    return this.service.getEntityListMeta({ accountId, filter });
  }

  @ApiOperation({ summary: 'Get available spots', description: 'Get available spots' })
  @ApiOkResponse({ description: 'Available spots', type: [Spot] })
  @Get('spots')
  async getAvailableSpots(
    @CurrentAuth() { accountId }: AuthData,
    @Query('scheduleId', ParseIntPipe) scheduleId: number,
    @Query('performerId', ParseIntPipe) performerId: number,
    @Query('minDate') minDate: string,
    @Query('maxDate') maxDate: string,
    @Query('daysLimit', ParseIntPipe) daysLimit: number,
  ) {
    return this.service.getAvailableSpots({
      accountId,
      scheduleId,
      performerId,
      minDate: new Date(minDate),
      maxDate: new Date(maxDate),
      daysLimit,
    });
  }

  @ApiOperation({ summary: 'Get schedule appointment', description: 'Get schedule appointment by ID' })
  @ApiParam({ name: 'appointmentId', description: 'Schedule appointment ID' })
  @ApiQuery({
    name: 'expand',
    type: String,
    required: false,
    isArray: true,
    description: 'Expand fields. Values: order,prevAppointmentCount,entityInfo.',
  })
  @ApiOkResponse({ description: 'Schedule appointments', type: ScheduleAppointmentDto })
  @Get(':appointmentId')
  async getOne(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Query() expand?: ExpandQuery<ExpandableField>,
  ) {
    return this.service.getOne({ accountId, user, appointmentId, options: { expand: expand.fields } });
  }

  @ApiOperation({ summary: 'Update schedule appointment', description: 'Update schedule appointment' })
  @ApiParam({ name: 'appointmentId', description: 'Schedule appointment ID' })
  @ApiBody({ description: 'Data for updating schedule appointment', type: UpdateScheduleAppointmentDto })
  @ApiOkResponse({ description: 'Schedule appointment', type: ScheduleAppointmentDto })
  @Patch(':appointmentId')
  async update(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() dto: UpdateScheduleAppointmentDto,
  ) {
    return this.service.update({ accountId, user, appointmentId, dto });
  }

  @ApiOperation({ summary: 'Delete schedule appointment', description: 'Delete schedule appointment' })
  @ApiParam({ name: 'appointmentId', description: 'Schedule appointment ID' })
  @ApiOkResponse()
  @Delete(':appointmentId')
  async delete(
    @CurrentAuth() { accountId, user }: AuthData,
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ) {
    return this.service.delete({ accountId, user, filter: { appointmentId } });
  }
}

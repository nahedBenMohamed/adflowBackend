import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { TransformToDto } from '@/common';
import { AuthData, CurrentAuth, JwtAuthorized } from '@/modules/iam/common';

import { CreateNoteDto, NoteDto, UpdateNoteDto } from './dto';
import { NoteService } from './note.service';

@ApiTags('crm/entities/notes')
@Controller('crm/entities/:entityId/notes')
@JwtAuthorized({ prefetch: { account: true } })
@TransformToDto()
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @ApiOperation({ summary: 'Create entity note', description: 'Create entity note' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiBody({ type: CreateNoteDto, required: true, description: 'Entity note data' })
  @ApiCreatedResponse({ description: 'Entity note', type: NoteDto })
  @Post()
  async create(
    @CurrentAuth() { account, userId }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Body() dto: CreateNoteDto,
  ): Promise<NoteDto> {
    return this.service.createAndGetDto({ account, userId, entityId, dto });
  }

  @ApiOperation({ summary: 'Get entity note', description: 'Get entity note' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiParam({ name: 'noteId', type: Number, required: true, description: 'Entity note ID' })
  @ApiOkResponse({ description: 'Entity note', type: NoteDto })
  @Get(':noteId')
  async findOne(
    @CurrentAuth() { account }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<NoteDto | null> {
    return this.service.findOneDto({ account, filter: { entityId, noteId } });
  }

  @ApiOperation({ summary: 'Get entity notes', description: 'Get entity notes' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiOkResponse({ description: 'Entity notes', type: NoteDto })
  @Get()
  async findMany(
    @CurrentAuth() { account }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
  ): Promise<NoteDto[]> {
    return this.service.findManyDto({ account, filter: { entityId } });
  }

  @ApiOperation({ summary: 'Update entity note', description: 'Update entity note' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiParam({ name: 'noteId', type: Number, required: true, description: 'Entity note ID' })
  @ApiBody({ type: UpdateNoteDto, required: true, description: 'Entity note data' })
  @ApiOkResponse({ description: 'Entity note', type: NoteDto })
  @Put(':noteId')
  async updatePut(
    @CurrentAuth() { account }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteDto> {
    return this.service.updateAndGetDto({ account, entityId, noteId, dto });
  }

  @ApiOperation({ summary: 'Update entity note', description: 'Update entity note' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiParam({ name: 'noteId', type: Number, required: true, description: 'Entity note ID' })
  @ApiBody({ type: UpdateNoteDto, required: true, description: 'Entity note data' })
  @ApiOkResponse({ description: 'Entity note', type: NoteDto })
  @Patch(':noteId')
  async updatePatch(
    @CurrentAuth() { account }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteDto> {
    return this.service.updateAndGetDto({ account, entityId, noteId, dto });
  }

  @ApiOperation({ summary: 'Delete entity note', description: 'Delete entity note' })
  @ApiParam({ name: 'entityId', type: Number, required: true, description: 'Entity ID' })
  @ApiParam({ name: 'noteId', type: Number, required: true, description: 'Entity note ID' })
  @ApiOkResponse()
  @Delete(':noteId')
  async delete(
    @CurrentAuth() { accountId }: AuthData,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ) {
    await this.service.delete({ accountId, entityId, noteId });
  }
}

import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { TransformToDto } from '@/common';

import {
  PublicSiteFormDto,
  PublicSiteFormFieldDto,
  SiteFormDataDto,
  SiteFormDataPlainDto,
  SiteFormFilesUploadRequest,
  SiteFormFileUploadResult,
  SiteFormResultDto,
} from './dto';
import { SiteFormBuilderService } from './site-form-builder.service';

const MaxSize = 52428800;

@ApiTags('site-forms/builder')
@Controller('builder')
@TransformToDto()
export class SiteFormBuilderController {
  constructor(private readonly service: SiteFormBuilderService) {}

  @ApiOperation({ summary: 'Get site form data', description: 'Get site form data' })
  @ApiParam({ name: 'code', type: String, required: true, description: 'Site form code' })
  @ApiQuery({ name: 'timezone', type: String, required: false, description: 'Timezone' })
  @ApiBody({ type: SiteFormDataDto, required: true, description: 'Site form data' })
  @ApiOkResponse({ description: 'Site form data', type: [PublicSiteFormDto] })
  @Get(':code')
  async find(@Param('code') code: string, @Query('timezone') timezone?: string, @Body() dto?: SiteFormDataDto) {
    return this.service.find({ code, dto, timezone });
  }

  @ApiOperation({ summary: 'Get site form field', description: 'Get site form field' })
  @ApiParam({ name: 'code', type: String, required: true, description: 'Site form code' })
  @ApiParam({ name: 'fieldId', type: Number, required: true, description: 'Site form field ID' })
  @ApiQuery({ name: 'timezone', type: String, required: false, description: 'Timezone' })
  @ApiBody({ type: SiteFormDataDto, required: true, description: 'Site form data' })
  @ApiOkResponse({ description: 'Site form field', type: [PublicSiteFormFieldDto] })
  @Post(':code/fields/:fieldId')
  async getField(
    @Param('code') code: string,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Query('timezone') timezone?: string,
    @Body() dto?: SiteFormDataDto,
  ) {
    return this.service.getField({ code, fieldId, dto, timezone });
  }

  @ApiOperation({ summary: 'Post site form data', description: 'Post site form data test in plain format' })
  @ApiParam({ name: 'code', type: String, required: true, description: 'Site form code' })
  @ApiBody({ type: SiteFormDataPlainDto, required: true, description: 'Site form data' })
  @ApiCreatedResponse({ description: 'Result', type: SiteFormResultDto })
  @Post('plain/:code')
  async postPlain(@Param('code') code: string, @Body() dto: SiteFormDataPlainDto) {
    return this.service.postPlain({ code, dto });
  }

  @ApiOperation({ summary: 'Post site form data', description: 'Post site form data' })
  @ApiParam({ name: 'code', type: String, required: true, description: 'Site form code' })
  @ApiBody({ type: SiteFormDataDto, required: true, description: 'Site form data' })
  @ApiCreatedResponse({ description: 'Result', type: SiteFormResultDto })
  @Post(':code')
  async post(@Param('code') code: string, @Body() dto: SiteFormDataDto) {
    return this.service.post({ code, dto });
  }

  @ApiOperation({ summary: 'Upload files', description: 'Upload files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Files to upload', type: SiteFormFilesUploadRequest })
  @ApiOkResponse({ description: 'Uploaded files info', type: [SiteFormFileUploadResult] })
  @Post(':code/upload')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async upload(
    @Param('code') code: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MaxSize })],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<SiteFormFileUploadResult[]> {
    return this.service.uploadFiles({ code, files });
  }
}

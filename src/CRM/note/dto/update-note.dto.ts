import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { NoteDto } from './note.dto';

export class UpdateNoteDto extends PickType(NoteDto, ['text']) {
  @ApiPropertyOptional({ type: [String], nullable: true, description: 'File IDs' })
  @IsOptional()
  fileIds?: string[] | null;
}

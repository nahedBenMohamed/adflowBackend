import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { DocumentType } from '../enums';
import { CheckDocumentDto } from './check-document.dto';

export class CreateDocumentDto extends CheckDocumentDto {
  @ApiProperty()
  @IsArray()
  types: DocumentType[];
}

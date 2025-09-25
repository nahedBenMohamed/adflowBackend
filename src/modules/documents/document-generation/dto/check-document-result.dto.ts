import { ApiProperty } from '@nestjs/swagger';

import { CheckDocumentMissingFieldDto } from './check-document-missing-field.dto';

export class CheckDocumentResultDto {
  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty({ type: [CheckDocumentMissingFieldDto] })
  missingFields: CheckDocumentMissingFieldDto[];

  @ApiProperty({ type: [String] })
  missingTags: string[];

  constructor({ isCorrect, missingFields, missingTags }: CheckDocumentResultDto) {
    this.isCorrect = isCorrect;
    this.missingFields = missingFields;
    this.missingTags = missingTags;
  }
}

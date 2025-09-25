import { ApiProperty } from '@nestjs/swagger';

import { FileLinkDto } from '@/CRM/Service/FileLink/FileLinkDto';

export class DocumentTemplateDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdBy: number;

  @ApiProperty({ nullable: true })
  file: FileLinkDto | null;

  @ApiProperty()
  accessibleBy: number[];

  @ApiProperty()
  entityTypeIds: number[];

  constructor(
    id: number,
    name: string,
    createdBy: number,
    file: FileLinkDto | null,
    accessibleBy: number[],
    entityTypeIds: number[],
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.file = file;
    this.accessibleBy = accessibleBy;
    this.entityTypeIds = entityTypeIds;
  }
}

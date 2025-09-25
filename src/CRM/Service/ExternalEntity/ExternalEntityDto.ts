import { ApiProperty } from '@nestjs/swagger';

import { UIDataRecord } from '../../Model/ExternalEntity/UIDataRecord';
import { ExternalEntity } from '../../Model/ExternalEntity/ExternalEntity';
import { ExternalSystem } from '../../Model/ExternalEntity/ExternalSystem';
import { ExternalSystemDto } from './ExternalSystemDto';

export class ExternalEntityDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  entityId: number;

  @ApiProperty()
  uiData: UIDataRecord[];

  @ApiProperty({ nullable: true })
  system: ExternalSystemDto | null;

  private constructor(
    id: number,
    url: string,
    entityId: number,
    system: ExternalSystemDto | null,
    uiData: UIDataRecord[] | null,
  ) {
    this.id = id;
    this.url = url;
    this.entityId = entityId;
    this.system = system;
    this.uiData = uiData;
  }

  public static create(entity: ExternalEntity, system: ExternalSystem) {
    return new ExternalEntityDto(
      entity.id,
      entity.url,
      entity.entityId,
      system ? ExternalSystemDto.create(system) : null,
      entity.uiData,
    );
  }
}

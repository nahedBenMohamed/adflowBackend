import { ApiProperty } from '@nestjs/swagger';

import { ExternalSystem } from '../../Model/ExternalEntity/ExternalSystem';

export class ExternalSystemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  private constructor(id: number, name: string, code: string) {
    this.id = id;
    this.name = name;
    this.code = code;
  }

  public static create(type: ExternalSystem) {
    return new ExternalSystemDto(type.id, type.name, type.code);
  }
}

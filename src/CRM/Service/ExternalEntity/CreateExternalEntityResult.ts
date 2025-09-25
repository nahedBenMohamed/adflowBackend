import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalEntityResult {
  @ApiProperty()
  entityCardUrl: string;

  constructor(crmCardUrl: string) {
    this.entityCardUrl = crmCardUrl;
  }
}

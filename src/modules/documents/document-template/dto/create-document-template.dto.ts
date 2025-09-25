import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDocumentTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  fileId: string | null;

  @ApiProperty()
  @IsArray()
  accessibleBy: number[];

  @ApiProperty()
  @IsArray()
  entityTypeIds: number[];
}

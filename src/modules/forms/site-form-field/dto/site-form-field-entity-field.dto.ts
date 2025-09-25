import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator';

export class SiteFormFieldEntityFieldDto {
  @ApiProperty()
  @IsNumber()
  entityTypeId: number;

  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isValidationRequired: boolean | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsObject()
  meta?: object | null;
}

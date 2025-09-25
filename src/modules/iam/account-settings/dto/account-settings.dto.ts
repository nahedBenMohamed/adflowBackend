import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { DateFormat } from '@/common';
import { PhoneFormat } from '../../common';

export class AccountSettingsDto {
  @ApiProperty({ description: 'Main language', examples: ['en', 'fr', 'pl'] })
  @IsString()
  language: string;

  @ApiProperty({
    nullable: true,
    description: 'Main working days',
    examples: ['Monday,Tuesday,Wednesday,Thursday,Friday', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
  })
  @IsOptional()
  @IsArray()
  workingDays: string[] | null;

  @ApiPropertyOptional({ nullable: true, description: 'Main start of week', examples: ['Monday', 'Sunday'] })
  @IsOptional()
  @IsString()
  startOfWeek: string | null;

  @ApiProperty({ nullable: true, description: 'Main working time from', examples: ['09:00', '21:00'] })
  @IsOptional()
  @IsString()
  workingTimeFrom: string | null;

  @ApiProperty({ nullable: true, description: 'Main working time to', examples: ['11:00', '23:00'] })
  @IsOptional()
  @IsString()
  workingTimeTo: string | null;

  @ApiProperty({ nullable: true, description: 'Main time zone', examples: ['Europe/London', 'America/New_York'] })
  @IsOptional()
  @IsString()
  timeZone: string | null;

  @ApiProperty({ description: 'Main currency', examples: ['USD', 'EUR', 'PLN'] })
  @IsString()
  currency: string;

  @ApiProperty({ nullable: true, description: 'Main number format', examples: ['9.999.999,99'] })
  @IsOptional()
  @IsString()
  numberFormat: string | null;

  @ApiProperty({ enum: PhoneFormat, description: 'Main phone format' })
  @IsEnum(PhoneFormat)
  phoneFormat: PhoneFormat;

  @ApiProperty({ description: 'Allow contact duplicates' })
  @IsBoolean()
  allowDuplicates: boolean;

  @ApiPropertyOptional({ nullable: true, enum: DateFormat, description: 'Main date format' })
  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat | null;

  @ApiProperty({ description: 'BPMN enabled' })
  @IsBoolean()
  isBpmnEnable: boolean;
}

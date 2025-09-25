import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PublicSiteFormOptionDto {
  @ApiProperty({ description: 'Option id' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Option label' })
  @IsNumber()
  label: string;

  @ApiProperty({ nullable: true, description: 'Option value' })
  @IsOptional()
  @IsString()
  color?: string | null;

  @ApiProperty({ description: 'Option sort order' })
  @IsNumber()
  sortOrder?: number;
}

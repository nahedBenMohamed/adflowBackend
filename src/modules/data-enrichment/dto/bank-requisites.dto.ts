import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { OpfType } from '../enums';

export class BankRequisitesDto {
  @ApiPropertyOptional({ description: 'Bank name', nullable: true })
  @IsOptional()
  @IsString()
  value?: string | null;

  @ApiPropertyOptional({ description: 'Bank name unrestricted', nullable: true })
  @IsOptional()
  @IsString()
  unrestrictedValue?: string | null;

  @ApiPropertyOptional({ description: 'Bank BIC', nullable: true })
  @IsOptional()
  @IsString()
  bic?: string | null;

  @ApiPropertyOptional({ description: 'Bank SWIFT', nullable: true })
  @IsOptional()
  @IsString()
  swift?: string | null;

  @ApiPropertyOptional({ description: 'Bank INN', nullable: true })
  @IsOptional()
  @IsString()
  inn?: string | null;

  @ApiPropertyOptional({ description: 'Bank KPP', nullable: true })
  @IsOptional()
  @IsString()
  kpp?: string | null;

  @ApiPropertyOptional({ description: 'Bank correspondent account', nullable: true })
  @IsOptional()
  @IsString()
  correspondentAccount?: string | null;

  @ApiPropertyOptional({ description: 'Bank payment city', nullable: true })
  @IsOptional()
  @IsString()
  paymentCity?: string | null;

  @ApiPropertyOptional({ description: 'Bank OPF type', nullable: true, enum: OpfType })
  @IsOptional()
  @IsEnum(OpfType)
  opf?: OpfType | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class MailboxSignatureDto {
  @ApiProperty({ description: 'Signature ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Signature created by user ID' })
  @IsNumber()
  createdBy: number;

  @ApiProperty({ description: 'Signature name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Signature text' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Signature text is HTML' })
  @IsBoolean()
  isHtml: boolean;

  @ApiProperty({ description: 'Signature linked mailboxes' })
  @IsArray()
  @IsNumber({}, { each: true })
  linkedMailboxes: number[];
}

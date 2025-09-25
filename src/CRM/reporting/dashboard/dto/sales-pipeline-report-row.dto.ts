import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SalesPipelineReportRowDto {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  stageId: number;

  @ApiProperty({ description: 'Stage name' })
  @IsString()
  stageName: string;

  @ApiProperty({ description: 'Stage color' })
  @IsString()
  stageColor: string;

  @ApiProperty({ description: 'Stage order' })
  @IsNumber()
  stageOrder: number;

  @ApiProperty({ nullable: true, description: 'Days count' })
  @IsOptional()
  @IsNumber()
  daysCount: number | null;

  @ApiProperty({ description: 'Percent' })
  @IsNumber()
  percent: number;

  @ApiProperty({ description: 'Value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Count' })
  @IsNumber()
  count: number;
}

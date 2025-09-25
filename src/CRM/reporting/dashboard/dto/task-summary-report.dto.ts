import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TaskSummaryReportDto {
  @ApiProperty({ description: 'Total tasks' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Completed tasks' })
  @IsNumber()
  completed: number;

  @ApiProperty({ description: 'Expired tasks' })
  @IsNumber()
  expired: number;

  @ApiProperty({ description: 'No task' })
  @IsNumber()
  noTask: number;
}

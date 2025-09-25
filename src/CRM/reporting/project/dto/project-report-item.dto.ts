import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ProjectReportItemDto {
  @ApiProperty({ description: 'Task count' })
  @IsNumber()
  taskCount: number;

  @ApiProperty({ nullable: true, description: 'Planned time' })
  @IsNumber()
  plannedTime: number | null;
}

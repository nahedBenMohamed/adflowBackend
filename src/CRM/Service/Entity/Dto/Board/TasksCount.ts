import { ApiProperty } from '@nestjs/swagger';

export class TasksCount {
  @ApiProperty()
  notResolved: number;

  @ApiProperty()
  overdue: number;

  @ApiProperty()
  today: number;

  @ApiProperty()
  resolved: number;

  constructor(notResolved: number, overdue: number, today: number, resolved: number) {
    this.notResolved = notResolved;
    this.overdue = overdue;
    this.today = today;
    this.resolved = resolved;
  }
}

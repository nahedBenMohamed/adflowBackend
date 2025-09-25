import { ApiProperty } from '@nestjs/swagger';

export class UserTimeAllocation {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  plannedTime: number;

  constructor(userId: number, plannedTime: number) {
    this.userId = userId;
    this.plannedTime = plannedTime;
  }
}

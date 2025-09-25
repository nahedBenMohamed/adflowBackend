import { ScheduleAppointmentStatus } from '../../common';
import { ScheduleAppointmentStatisticDto } from '../dto';

export class ScheduleAppointmentStatistic {
  total: number;
  statuses: Record<ScheduleAppointmentStatus, number>;
  newbies: number;
  notScheduled: number;
  notTookPlace: number;

  constructor({
    total,
    statuses,
    newbies,
    notScheduled,
    notTookPlace,
  }: {
    total: number;
    statuses: Record<ScheduleAppointmentStatus, number>;
    newbies: number;
    notScheduled: number;
    notTookPlace: number;
  }) {
    this.total = total;
    this.statuses = statuses;
    this.newbies = newbies;
    this.notScheduled = notScheduled;
    this.notTookPlace = notTookPlace;
  }

  public toDto(): ScheduleAppointmentStatisticDto {
    return {
      total: this.total,
      statuses: this.statuses,
      newbies: this.newbies,
      notScheduled: this.notScheduled,
      notTookPlace: this.notTookPlace,
    };
  }
}

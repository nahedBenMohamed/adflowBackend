import { ScheduleAppointmentStatus } from '@/modules/scheduler/common';
import { CalendarEventStatus } from '../types';

export class AppointmentUtil {
  public static convertAppointmentStatus(status: ScheduleAppointmentStatus): CalendarEventStatus | undefined {
    switch (status) {
      case ScheduleAppointmentStatus.Canceled:
        return 'cancelled';
      case ScheduleAppointmentStatus.NotConfirmed:
        return 'tentative';
      case ScheduleAppointmentStatus.Confirmed:
        return 'confirmed';
      default:
        return undefined;
    }
  }

  public static convertEventStatus(status: string): ScheduleAppointmentStatus {
    switch (status) {
      case 'cancelled':
        return ScheduleAppointmentStatus.Canceled;
      case 'tentative':
        return ScheduleAppointmentStatus.NotConfirmed;
      case 'confirmed':
        return ScheduleAppointmentStatus.Confirmed;
      default:
        return ScheduleAppointmentStatus.NotConfirmed;
    }
  }
}

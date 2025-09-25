import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class AppointmentDayLimitError extends ServiceError {
  constructor({ appointmentId, message = 'Appointment day limit error' }: { appointmentId: number; message?: string }) {
    super({
      errorCode: 'scheduler.appointment.day_limit',
      status: HttpStatus.BAD_REQUEST,
      message,
      details: { appointmentId },
    });
  }
}

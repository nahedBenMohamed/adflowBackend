import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class AppointmentDatesConflictError extends ServiceError {
  constructor(message = 'Start date is more or equal than end date') {
    super({ errorCode: 'scheduler.appointment.dates_conflict', status: HttpStatus.BAD_REQUEST, message });
  }
}

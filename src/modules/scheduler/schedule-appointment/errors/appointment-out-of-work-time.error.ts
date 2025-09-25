import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class AppointmentOutOfWorkTimeError extends ServiceError {
  constructor(message = 'Appointment is out of work time') {
    super({ errorCode: 'scheduler.appointment.out_of_work_time', status: HttpStatus.BAD_REQUEST, message });
  }
}

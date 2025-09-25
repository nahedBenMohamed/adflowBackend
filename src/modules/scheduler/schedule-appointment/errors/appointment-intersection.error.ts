import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class AppointmentIntersectionError extends ServiceError {
  constructor(message = 'Intersect appointments') {
    super({ errorCode: 'scheduler.appointment.intersection', status: HttpStatus.BAD_REQUEST, message });
  }
}

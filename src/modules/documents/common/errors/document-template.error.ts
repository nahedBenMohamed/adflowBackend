import { HttpStatus } from '@nestjs/common';

import { ServiceError } from '@/common';

export class DocumentTemplateError extends ServiceError {
  constructor(message = 'Wrong template') {
    super({ errorCode: 'document.template.wrong_template', status: HttpStatus.BAD_REQUEST, message });
  }
}

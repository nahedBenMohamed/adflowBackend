import parsePhoneNumberWithError, { ParseError } from 'libphonenumber-js';
import { InvalidPhoneError } from '../errors';

export class PhoneUtil {
  static normalize(phone: string): string {
    try {
      return parsePhoneNumberWithError(phone).number;
    } catch (e) {
      if (e instanceof ParseError) {
        throw new InvalidPhoneError(e.message);
      } else {
        throw new InvalidPhoneError();
      }
    }
  }
}

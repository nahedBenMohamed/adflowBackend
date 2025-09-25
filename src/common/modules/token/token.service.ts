import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';

import { InvalidTokenError } from './errors';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  create(payload: Buffer | object, options?: { expiresIn?: number | string }): string {
    return this.jwtService.sign(payload, options);
  }

  verify<Payload extends object>(token: string): Payload {
    try {
      return this.jwtService.verify<Payload>(token);
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidTokenError(e.message);
      }
      throw e;
    }
  }
}

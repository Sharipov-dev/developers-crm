import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

import type { JwtPayload, JwtService } from '../../application/services/jwt.service.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';

export class JwtTokenService implements JwtService {
  private readonly options: jwt.SignOptions;

  constructor(
    private readonly secret: string,
    expiresIn: string
  ) {
    this.options = { expiresIn: expiresIn as StringValue };
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, this.options);
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return { userId: decoded.userId };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

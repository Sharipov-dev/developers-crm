import { createRemoteJWKSet, jwtVerify } from 'jose';

import type { JwtPayload, JwtService } from '../../application/services/jwt.service.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';

export class SupabaseJwtService implements JwtService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly jwksUrl: string,
    private readonly issuer: string,
    private readonly audience?: string | string[],
  ) {
    this.jwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        ...(this.audience ? { audience: this.audience } : {}),
      });

      if (!payload.sub) {
        throw new UnauthorizedError('Token missing subject claim');
      }

      return { userId: payload.sub };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

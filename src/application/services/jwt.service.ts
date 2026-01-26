export interface JwtPayload {
  userId: string;
}

export interface JwtService {
  sign(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
}

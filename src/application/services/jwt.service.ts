export interface JwtPayload {
  userId: string;
}

export interface JwtService {
  verify(token: string): Promise<JwtPayload>;
}

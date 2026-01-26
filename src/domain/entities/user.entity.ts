export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName?: string | undefined;
}

export interface UpdateUserData {
  displayName?: string | undefined;
}

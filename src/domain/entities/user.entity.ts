export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
}

export interface UpdateUserData {
  email?: string | undefined;
  name?: string | undefined;
}

// user.types.ts

export type UserRole = 'USER' | 'ADMIN' | 'PRODUCER';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  farmName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

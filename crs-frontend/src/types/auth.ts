export type Role = 'ADMIN' | 'USER';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  hoTen: string;
  mssv: string;
}

export interface RegisterResponse {
  userId: number;
  studentId: number;
  username: string;
  hoTen: string;
  mssv: string;
  role: Role;
}

export interface CurrentUserResponse {
  username: string;
  roles: Role[];
  studentId?: number;
  hoTen?: string;
  mssv?: string;
}

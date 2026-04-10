export interface AuthUser {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SignupPayload {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

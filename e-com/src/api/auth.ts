import { apiRequest } from '@/src/api/http';
import { AuthResponse, LoginPayload, SignupPayload } from '@/src/types/models';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),

  signup: (payload: SignupPayload) =>
    apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: payload,
    }),
};
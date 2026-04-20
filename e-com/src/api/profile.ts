import { apiRequest } from '@/src/api/http';
import { AuthUser, UpdateProfilePayload } from '@/src/types/models';

export const profileApi = {
  getProfile: (userId: string, token: string) =>
    apiRequest<{ user: AuthUser }>(`/profiles/${userId}`, {
      token,
    }),

  updateProfile: (userId: string, payload: UpdateProfilePayload, token: string) =>
    apiRequest<{ user: AuthUser }>(`/profiles/${userId}`, {
      method: 'PATCH',
      token,
      body: payload,
    }),
};
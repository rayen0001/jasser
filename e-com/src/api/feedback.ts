import { apiRequest } from '@/src/api/http';
import { Feedback, ProductStats } from '@/src/types/models';

type CreateFeedbackPayload = {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
};

export const feedbackApi = {
  getPerProduct: (productId: string) =>
    apiRequest<{ feedbacks: Feedback[] }>(`/feedbacks/product/${productId}`),

  statsPerProduct: (productId: string, token: string) =>
    apiRequest<{ stats: ProductStats }>(`/feedbacks/stats/product/${productId}`, {
      token,
    }),

  create: (payload: CreateFeedbackPayload, token: string) =>
    apiRequest<{ feedback: Feedback }>('/feedbacks', {
      method: 'POST',
      token,
      body: payload,
    }),
};
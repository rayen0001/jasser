import { apiRequest } from '@/src/api/http';
import { CreateOrderPayload, Order } from '@/src/types/models';

export const ordersApi = {
  create: (payload: CreateOrderPayload, token: string) =>
    apiRequest<{ order: unknown; updatedStock: number }>('/orders', {
      method: 'POST',
      token,
      body: payload,
    }),

  historyPerUser: (userId: string, token: string) =>
    apiRequest<{ orders: Order[] }>(`/orders/history/${userId}`, {
      token,
    }),
};
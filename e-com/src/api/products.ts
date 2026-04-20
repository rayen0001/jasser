import { apiRequest } from '@/src/api/http';
import { Product } from '@/src/types/models';

export const productsApi = {
  getAll: () => apiRequest<{ products: Product[] }>('/products'),
  getOne: (id: string) => apiRequest<{ product: Product }>(`/products/${id}`),
};
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    ref: string;
    thumbnail?: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusCounts: Record<OrderStatus, number>;
}
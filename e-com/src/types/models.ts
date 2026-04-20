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

export interface LoginPayload {
  email: string;
  password: string;
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

export interface Product {
  _id: string;
  name: string;
  ref: string;
  desc: string;
  price: number;
  category: string;
  stock: number;
  remisComposerd: {
    enabled: boolean;
    percentage: number;
  };
  thumbnail?: string;
  images: string[];
  averageRate?: number;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  helpful?: number;
  unhelpful?: number;
  createdAt: string;
}

export interface ProductStats {
  productId: string;
  totalFeedbacks: number;
  averageRate: number;
  totalHelpful: number;
  totalUnhelpful: number;
  distribution: {
    rate1: number;
    rate2: number;
    rate3: number;
    rate4: number;
    rate5: number;
  };
}

export interface UpdateProfilePayload {
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  birthday?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  ref: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  category?: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  ref: string;
  price: number;
  thumbnail?: string;
  category?: string;
  addedAt: string;
}

export interface CreateOrderPayload {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  shippingAddress: string;
  paymentMethod: string;
}

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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
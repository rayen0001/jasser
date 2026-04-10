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

export interface CreateFeedbackPayload {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export interface GlobalStats {
  totalFeedbacks: number;
  averageRate: number;
  totalHelpful: number;
  totalUnhelpful: number;
}

export interface ProductStats extends GlobalStats {
  productId: string;
  distribution: {
    rate1: number;
    rate2: number;
    rate3: number;
    rate4: number;
    rate5: number;
  };
}
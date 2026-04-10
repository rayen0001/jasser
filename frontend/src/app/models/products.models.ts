export interface RemisComposerd {
  enabled: boolean;
  percentage: number;
}

export interface Product {
  _id: string;
  name: string;
  ref: string;
  desc: string;
  price: number;
  category: string;
  stock: number;
  remisComposerd: RemisComposerd;
  thumbnail?: string;
  images: string[];
  averageRate?: number;
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  ref: string;
  desc: string;
  price: number;
  category: string;
  stock?: number;
  remisComposerd?: RemisComposerd;
  thumbnail?: File;
  images?: File[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  existingImages?: string[];
}
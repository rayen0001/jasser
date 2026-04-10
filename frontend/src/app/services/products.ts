import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateProductPayload, Product, UpdateProductPayload } from '../models/products.models';

@Injectable({ providedIn: 'root' })
export class Products {
  private readonly BASE_URL = environment.baseUrl;

  constructor(private http: HttpClient) {}

  create(payload: CreateProductPayload): Observable<{ product: Product }> {
    return this.http.post<{ product: Product }>(
      `${this.BASE_URL}/products`,
      this.toFormData(payload)
    );
  }

  getAll(): Observable<{ products: Product[] }> {
    return this.http.get<{ products: Product[] }>(
      `${this.BASE_URL}/products`
    );
  }

  getOne(id: string): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(
      `${this.BASE_URL}/products/${id}`
    );
  }

  update(id: string, payload: UpdateProductPayload): Observable<{ product: Product }> {
    return this.http.put<{ product: Product }>(
      `${this.BASE_URL}/products/${id}`,
      this.toFormData(payload)
    );
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.BASE_URL}/products/${id}`
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private toFormData(payload: Record<string, any>): FormData {
    const fd = new FormData();

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue;

      if (key === 'thumbnail' && value instanceof File) {
        fd.append('thumbnail', value);
      } else if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: File) => fd.append('images', file));
      } else if (key === 'existingImages' && Array.isArray(value)) {
        fd.append('existingImages', JSON.stringify(value));
      } else if (key === 'remisComposerd' && typeof value === 'object') {
        fd.append('remisComposerd', JSON.stringify(value));
      } else {
        fd.append(key, String(value));
      }
    }

    return fd;
  }
}
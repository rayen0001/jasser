import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateOrderPayload, Order, OrderStats, OrderStatus } from '../models/orders.models';

@Injectable({ providedIn: 'root' })
export class Orders{
  private readonly BASE_URL = environment.baseUrl;

  constructor(private http: HttpClient) {}

  create(payload: CreateOrderPayload): Observable<{ order: Order; updatedStock: number }> {
    return this.http.post<{ order: Order; updatedStock: number }>(
      `${this.BASE_URL}/orders`,
      payload
    );
  }

  historyPerUser(userId: string): Observable<{ orders: Order[] }> {
    return this.http.get<{ orders: Order[] }>(
      `${this.BASE_URL}/orders/history/${userId}`
    );
  }

  getAll(): Observable<{ orders: Order[] }> {
    return this.http.get<{ orders: Order[] }>(
      `${this.BASE_URL}/orders`
    );
  }

  updateStatus(orderId: string, status: OrderStatus): Observable<{ order: Order }> {
    return this.http.patch<{ order: Order }>(
      `${this.BASE_URL}/orders/${orderId}/status`,
      { status }
    );
  }

  stats(): Observable<{ stats: OrderStats }> {
    return this.http.get<{ stats: OrderStats }>(
      `${this.BASE_URL}/orders/stats/global`
    );
  }
}
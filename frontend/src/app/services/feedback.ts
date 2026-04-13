import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateFeedbackPayload, Feedback, GlobalStats, ProductStats } from '../models/feedback.models';

@Injectable({ providedIn: 'root' })
export class Feedbacks {
  private readonly BASE_URL = environment.baseUrl;  // your API base URL

  constructor(private http: HttpClient) {}

  create(payload: CreateFeedbackPayload): Observable<{ feedback: Feedback }> {
    return this.http.post<{ feedback: Feedback }>(
      `${this.BASE_URL}/feedbacks`,
      payload
    );
  }

  getPerProduct(productId: string): Observable<{ feedbacks: Feedback[] }> {
    return this.http.get<{ feedbacks: Feedback[] }>(
      `${this.BASE_URL}/feedbacks/product/${productId}`
    );
  }

  globalStats(): Observable<{ stats: GlobalStats }> {
    return this.http.get<{ stats: GlobalStats }>(
      `${this.BASE_URL}/feedbacks/stats/global`
    );
  }

  statsPerProduct(productId: string): Observable<{ stats: ProductStats }> {
    return this.http.get<{ stats: ProductStats }>(
      `${this.BASE_URL}/feedbacks/stats/product/${productId}`
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UpdateProfilePayload, UserProfile } from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileS {
  private readonly BASE_URL = environment.baseUrl; 

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<{ user: UserProfile }> {
    return this.http.get<{ user: UserProfile }>(
      `${this.BASE_URL}/profile/${userId}`
    );
  }

  updateProfile(userId: string, payload: UpdateProfilePayload): Observable<{ user: UserProfile }> {
    return this.http.put<{ user: UserProfile }>(
      `${this.BASE_URL}/profile/${userId}`,
      payload
    );
  }
}
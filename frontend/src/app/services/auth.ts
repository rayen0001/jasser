import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, AuthUser, LoginPayload, SignupPayload } from '../models/auth.models';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly BASE_URL = environment.baseUrl; 
 
  constructor(private http: HttpClient) {}
  
 
  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.BASE_URL}/auth/signup`, payload)
      .pipe(tap((res) => this.saveSession(res)));
  }
 
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.BASE_URL}/auth/login`, payload)
      .pipe(tap((res) => this.saveSession(res)));
  }
 
  async logout(): Promise<void> {
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'user' });
  }
 
  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'token' });
    return value;
  }
 
  async getUser(): Promise<AuthUser | null> {
    const { value } = await Preferences.get({ key: 'user' });
    return value ? (JSON.parse(value) as AuthUser) : null;
  }
 
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
 
  private saveSession(res: AuthResponse): void {
    void Preferences.set({ key: 'token', value: res.token });
    void Preferences.set({ key: 'user', value: JSON.stringify(res.user) });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  IonHeader,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../services/auth';
import { LoginPayload, SignupPayload } from '../models/auth.models';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
})
export class AuthPage implements OnInit {
  mode: 'login' | 'signup' = 'login';
  isLoading = false;
  errorMessage = '';

  loginForm: LoginPayload = {
    email: '',
    password: '',
  };

  signupForm: SignupPayload & { confirmPassword: string } = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    phone: '',
    avatar: '',
    gender: '',
  };

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {}

  setMode(mode: string | number | undefined): void {
    if (mode !== 'login' && mode !== 'signup') {
      return;
    }

    this.mode = mode;
    this.errorMessage = '';
  }

  async submit(): Promise<void> {
    this.errorMessage = '';

    if (this.mode === 'login') {
      await this.login();
      return;
    }

    await this.signup();
  }

  private async login(): Promise<void> {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.auth.login(this.loginForm));
      await this.routeByRole(response.user.role);
    } catch {
      this.errorMessage = 'Login failed. Please check your credentials.';
    } finally {
      this.isLoading = false;
    }
  }

  private async signup(): Promise<void> {
    if (
      !this.signupForm.username ||
      !this.signupForm.firstname ||
      !this.signupForm.lastname ||
      !this.signupForm.email ||
      !this.signupForm.password
    ) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (this.signupForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    try {
      const payload: SignupPayload = {
        username: this.signupForm.username,
        firstname: this.signupForm.firstname,
        lastname: this.signupForm.lastname,
        email: this.signupForm.email,
        password: this.signupForm.password,
        birthday: this.signupForm.birthday || undefined,
        phone: this.signupForm.phone || undefined,
        avatar: this.signupForm.avatar || undefined,
        gender: this.signupForm.gender || undefined,
      };

      const response = await firstValueFrom(this.auth.signup(payload));
      await this.routeByRole(response.user.role);
    } catch {
      this.errorMessage = 'Signup failed. Try another email or username.';
    } finally {
      this.isLoading = false;
    }
  }

  private async routeByRole(role?: string): Promise<void> {
    if ((role || '').toLowerCase() === 'admin') {
      await this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
      return;
    }

    await this.router.navigateByUrl('/user/shop', { replaceUrl: true });
  }

}

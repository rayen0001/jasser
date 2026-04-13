import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { settingsOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { ProfileService } from '../../services/profile';
import { UpdateProfilePayload, UserProfile } from '../../models/profile.models';

type AvatarStyleOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonToolbar,
    IonTitle,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class ProfilePage implements OnInit {
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  profile: UserProfile | null = null;

  form = {
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    birthday: '',
    phone: '',
    gender: '',
  };

  avatarStyle = 'adventurer-neutral';
  avatarSeed = '';
  readonly settingsIcon = settingsOutline;

  readonly avatarStyles: AvatarStyleOption[] = [
    { value: 'adventurer-neutral', label: 'Adventurer Neutral' },
    { value: 'avataaars-neutral', label: 'Avataaars Neutral' },
    { value: 'bottts-neutral', label: 'Bottts Neutral' },
    { value: 'lorelei', label: 'Lorelei' },
    { value: 'personas', label: 'Personas' },
  ];

  readonly genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  constructor(private auth: Auth, private profileService: ProfileService) {}

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  get displayName(): string {
    return (
      [this.form.firstname, this.form.lastname].filter(Boolean).join(' ').trim() ||
      this.form.username ||
      'Your profile'
    );
  }

  get avatarUrl(): string {
    return this.buildAvatarUrl(this.avatarSeed || this.defaultAvatarSeed, this.avatarStyle);
  }

  get defaultAvatarSeed(): string {
    return (
      [this.form.username, this.form.firstname, this.form.lastname].filter(Boolean).join(' ').trim() ||
      'guest'
    );
  }

  get createdAtLabel(): string {
    if (!this.profile?.createdAt) {
      return 'Unknown';
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(this.profile.createdAt));
  }

  async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const savedUser = await this.auth.getUser();

      if (!savedUser) {
        this.errorMessage = 'No saved profile was found. Please sign in again.';
        return;
      }

      this.applyProfile(savedUser);

      try {
        const response = await firstValueFrom(this.profileService.getProfile(savedUser.id));
        this.applyProfile(response.user);
        await Preferences.set({ key: 'user', value: JSON.stringify(response.user) });
      } catch {
        // Keep the locally stored user when the profile endpoint is unavailable.
      }
    } catch {
      this.errorMessage = 'Unable to load your profile right now.';
    } finally {
      this.isLoading = false;
    }
  }

  randomizeAvatar(): void {
    this.avatarSeed = `${this.defaultAvatarSeed}-${Math.random().toString(36).slice(2, 9)}`;
  }

  useNameSeed(): void {
    this.avatarSeed = '';
  }

  async saveProfile(): Promise<void> {
    if (!this.profile?.id) {
      this.errorMessage = 'Load a profile before saving changes.';
      return;
    }

    if (!this.form.username || !this.form.firstname || !this.form.lastname || !this.form.email) {
      this.errorMessage = 'Username, first name, last name, and email are required.';
      return;
    }

    const payload: UpdateProfilePayload = {
      username: this.form.username.trim(),
      firstname: this.form.firstname.trim(),
      lastname: this.form.lastname.trim(),
      email: this.form.email.trim(),
      birthday: this.form.birthday || undefined,
      phone: this.form.phone || undefined,
      gender: this.form.gender || undefined,
      avatar: this.avatarUrl,
    };

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await firstValueFrom(this.profileService.updateProfile(this.profile.id, payload));
      this.applyProfile(response.user);
      await Preferences.set({ key: 'user', value: JSON.stringify(response.user) });
      this.successMessage = 'Profile saved successfully.';
    } catch {
      this.errorMessage = 'Unable to save your profile changes.';
    } finally {
      this.isSaving = false;
    }
  }

  private applyProfile(user: UserProfile): void {
    this.profile = user;
    this.form = {
      username: user.username || '',
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      birthday: user.birthday || '',
      phone: user.phone || '',
      gender: user.gender || '',
    };
    this.avatarStyle = this.extractAvatarStyle(user.avatar) || 'adventurer-neutral';
    this.avatarSeed = this.extractAvatarSeed(user.avatar) || '';
  }

  private extractAvatarStyle(avatar?: string): string | null {
    if (!avatar) {
      return null;
    }

    try {
      const url = new URL(avatar);
      const match = url.pathname.match(/\/9\.x\/([^/]+)\/svg/i);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }

  private extractAvatarSeed(avatar?: string): string | null {
    if (!avatar) {
      return null;
    }

    try {
      const url = new URL(avatar);
      return url.searchParams.get('seed');
    } catch {
      return null;
    }
  }

  private buildAvatarUrl(seed: string, style: string): string {
    const safeSeed = seed.trim() || 'guest';
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(safeSeed)}&backgroundColor=b6e3f4,ffd5dc,c0aede,ffdfbf`;
  }

}

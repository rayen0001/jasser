import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonTitle,
  IonToolbar,
  ActionSheetController,
  IonBackButton,
} from '@ionic/angular/standalone';
import { moon, sunny } from 'ionicons/icons';
import { Settings } from '../services/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
  ],
})
export class SettingsPage implements OnInit {
  language = 'en';
  theme = 'light';
  currency = 'USD';
  sunIcon = sunny;
  moonIcon = moon;

  readonly languageOptions = [
    { value: 'en', label: 'English', flagClass: 'fi-gb' },
    { value: 'fr', label: 'French', flagClass: 'fi-fr' },
  ];

  readonly themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  readonly currencyOptions = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
  ];

  constructor(private settings: Settings, private actionSheetCtrl: ActionSheetController) {}

  ngOnInit() {
    const current = this.settings.getAllSettings();
    this.language = current.language;
    this.theme = current.theme;
    this.currency = current.currency;
    this.applyTheme();
  }

  saveSettings(): void {
    if (this.settings.isValidLanguage(this.language)) {
      this.settings.setLanguage(this.language);
    }

    if (this.settings.isValidTheme(this.theme)) {
      this.settings.setTheme(this.theme);
    }

    if (this.settings.isValidCurrency(this.currency)) {
      this.settings.setCurrency(this.currency);
    }

    this.applyTheme();
  }

  resetSettings(): void {
    this.settings.resetSettings();
    const current = this.settings.getAllSettings();
    this.language = current.language;
    this.theme = current.theme;
    this.currency = current.currency;
    this.applyTheme();
  }

  get languageFlag(): string {
    return this.settings.getLanguageFlag(this.language);
  }

  get currencySymbol(): string {
    return this.settings.getCurrencySymbol(this.currency);
  }

  getLanguageFlagFor(language: string): string {
    return this.settings.getLanguageFlag(language);
  }

  getSelectedLanguageText(): string {
    const selected = this.languageOptions.find((option) => option.value === this.language);
    if (!selected) {
      return this.language.toUpperCase();
    }

    return selected.label;
  }

  getCurrentLanguageOption() {
    return this.languageOptions.find((option) => option.value === this.language);
  }

  getCurrencySymbolFor(currency: string): string {
    return this.settings.getCurrencySymbol(currency);
  }

  onThemeToggle(isDark: boolean): void {
    this.theme = isDark ? 'dark' : 'light';
    this.applyTheme();
  }

  private applyTheme(): void {
    this.settings.applyTheme(this.theme);
  }

  async presentLanguageActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Language',
      buttons: [
        ...this.languageOptions.map((option) => ({
          text: option.label,
          icon: undefined,
          data: { value: option.value },
          handler: () => {
            this.language = option.value;
          },
        })),
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

}

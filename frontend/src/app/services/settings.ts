import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Settings {
  private language: string = 'en';
  private theme: string = 'light';
  private currency: string = 'USD';

  constructor() {
    this.loadSettings();
    this.applyTheme(this.theme);
  }

  private loadSettings(): void {
    this.language = localStorage.getItem('language') || 'en';
    this.theme = localStorage.getItem('theme') || 'light';
    this.currency = localStorage.getItem('currency') || 'USD';
  }

  getLanguage(): string {
    return this.language;
  }

  setLanguage(language: string): void {
    this.language = language;
    localStorage.setItem('language', language);
  }

  getTheme(): string {
    return this.theme;
  }

  setTheme(theme: string): void {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  getCurrency(): string {
    return this.currency;
  }

  setCurrency(currency: string): void {
    this.currency = currency;
    localStorage.setItem('currency', currency);
  }
  getLanguageFlag(language: string): string {
    const flags: { [key: string]: string } = {
      en: '🇺🇸',
      fr: '🇫🇷',
    };
    return flags[language] || '🌐';
  }

  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
    };
    return symbols[currency] || '¤';
  }
  getAllSettings(): { language: string; theme: string; currency: string } {
    return {
      language: this.language,
      theme: this.theme,
      currency: this.currency,
    };
  }

  resetSettings(): void {
    this.setLanguage('en');
    this.setTheme('light');
    this.setCurrency('USD');
  }

  isValidLanguage(language: string): boolean {
    return ['en', 'fr'].includes(language);
  }

  isValidTheme(theme: string): boolean {
    return ['light', 'dark'].includes(theme);
  }

  isValidCurrency(currency: string): boolean {
    return ['USD', 'EUR'].includes(currency);
  }

  applyTheme(theme: string = this.theme): void {
    document.body.classList.toggle('dark', theme === 'dark');
  }
}

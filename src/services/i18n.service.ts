// src/services/i18n.service.ts
// Internationalization & dynamic client-side DOM translation service

import { type SupportedLanguage, type LanguageMeta, getTranslation, SUPPORTED_LANGUAGES } from '../data/translations';
import { StorageService } from './storage.service';

export class I18nService {
  static getCurrentLanguage(): SupportedLanguage {
    return (StorageService.getLanguage() as SupportedLanguage) || 'en';
  }

  static getLanguageMeta(code?: string): LanguageMeta {
    const langCode = code || this.getCurrentLanguage();
    return SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
  }

  static setLanguage(lang: SupportedLanguage | string): void {
    StorageService.setLanguage(lang);
  }

  static t(key: string, fallback?: string): string {
    if (!key) return fallback || '';
    const lang = this.getCurrentLanguage();
    const translated = getTranslation(lang, key);
    if (translated && translated !== key) return translated;
    return fallback || translated || key;
  }

  static translateWeather(condition: string): string {
    if (!condition) return '';
    const lang = this.getCurrentLanguage();
    const translated = getTranslation(lang, condition);
    if (translated && translated !== condition) return translated;
    return this.t(condition, condition);
  }

  static translateCrop(crop: string): string {
    return this.t(crop, crop);
  }

  static translateStage(stage: string): string {
    return this.t(stage, stage);
  }

  static translateWindDir(dir: string): string {
    if (!dir) return '';
    const lang = this.getCurrentLanguage();
    const translated = getTranslation(lang, dir);
    if (translated && translated !== dir) return translated;
    return dir;
  }

  static translateDay(day: string): string {
    if (!day) return '';
    const lang = this.getCurrentLanguage();
    const translated = getTranslation(lang, day);
    if (translated && translated !== day) return translated;
    return day;
  }

  static getSupportedLanguages(): LanguageMeta[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Translates all DOM elements containing data-i18n, data-i18n-placeholder,
   * data-i18n-title, or data-i18n-html attributes within the specified root.
   */
  static translateDocument(root: Element | Document = document): void {
    if (typeof window === 'undefined' || !root) return;

    const currentLang = this.getCurrentLanguage();

    // 1. data-i18n (text content)
    const textElements = root.querySelectorAll('[data-i18n]');
    textElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translated = getTranslation(currentLang, key);
        if (translated) {
          el.textContent = translated;
        }
      }
    });

    // 2. data-i18n-html (inner HTML)
    const htmlElements = root.querySelectorAll('[data-i18n-html]');
    htmlElements.forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        const translated = getTranslation(currentLang, key);
        if (translated) {
          el.innerHTML = translated;
        }
      }
    });

    // 3. data-i18n-placeholder (input / textarea placeholder)
    const placeholderElements = root.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const translated = getTranslation(currentLang, key);
        if (translated) {
          (el as HTMLInputElement).placeholder = translated;
        }
      }
    });

    // 4. data-i18n-title (title and aria-label)
    const titleElements = root.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const translated = getTranslation(currentLang, key);
        if (translated) {
          el.setAttribute('title', translated);
          if (el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', translated);
          }
        }
      }
    });
  }

  private static isInitialized = false;

  /**
   * Initializes the i18n subsystem: applies initial translations to document and binds
   * to global 'mausam-language-changed' event for reactive live updates.
   */
  static initI18n(): void {
    if (typeof window === 'undefined') return;

    if (!this.isInitialized) {
      this.isInitialized = true;
      window.addEventListener('mausam-language-changed', () => {
        this.translateDocument();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.translateDocument());
    } else {
      this.translateDocument();
    }
  }
}

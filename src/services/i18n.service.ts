// src/services/i18n.service.ts
// Internationalization & language preference service

import { TRANSLATIONS, type SupportedLanguage, getTranslation, SUPPORTED_LANGUAGES } from '../data/translations';
import { StorageService } from './storage.service';

export class I18nService {
  static getCurrentLanguage(): SupportedLanguage {
    return (StorageService.getLanguage() as SupportedLanguage) || 'en';
  }

  static setLanguage(lang: SupportedLanguage): void {
    StorageService.setLanguage(lang);
  }

  static t(key: string): string {
    const lang = this.getCurrentLanguage();
    return getTranslation(lang, key);
  }

  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

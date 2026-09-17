// src/services/profile.service.ts
// Persona & Profile management service

import { PERSONAS, PERSONA_LIST, type PersonaDefinition } from '../data/personas';
import { PROFILE_CONFIGS, getProfileConfig, type PersonaProfileConfig } from '../data/profileControls';
import { StorageService } from './storage.service';

export class ProfileService {
  static getActivePersonaId(): string {
    return StorageService.getActivePersona();
  }

  static setActivePersonaId(id: string): void {
    StorageService.setActivePersona(id);
  }

  static getActivePersona(): PersonaDefinition {
    const id = this.getActivePersonaId();
    return PERSONAS[id] || PERSONAS.farmer;
  }

  static getActiveProfileConfig(): PersonaProfileConfig {
    const id = this.getActivePersonaId();
    return getProfileConfig(id);
  }

  static getAllPersonas(): PersonaDefinition[] {
    return PERSONA_LIST;
  }

  static getSetting(key: string, defaultValue: any = null): any {
    const personaId = this.getActivePersonaId();
    const settings = StorageService.getProfileCustomSettings(personaId);
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  static setSetting(key: string, value: any): void {
    const personaId = this.getActivePersonaId();
    StorageService.setProfileCustomSetting(personaId, key, value);
  }
}

/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly WEATHER_API_KEY: string;
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

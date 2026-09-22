// src/services/data-validator.service.ts
// Enterprise-Grade Meteorological Data Validation & Normalization Layer for Mausam
// Enforces scientific physical limits, sanitizes API errors, and tags explicit data states

export type DataFieldStatus = 'valid' | 'unavailable' | 'unknown' | 'stale' | 'invalid';

export interface ValidatedField<T = number | string | boolean> {
  value: T | null;
  raw: any;
  unit: string;
  status: DataFieldStatus;
  statusReason?: string;
}

export interface ValidatedEnvironmentalState {
  location: {
    name: string;
    country: string;
    region?: string;
    status: DataFieldStatus;
  };
  temperature: ValidatedField<number>;
  feelsLike: ValidatedField<number>;
  humidity: ValidatedField<number>;
  windSpeed: ValidatedField<number>;
  windGust: ValidatedField<number>;
  windDirection: ValidatedField<string>;
  rainfall24h: ValidatedField<number>;
  rainfallHourly: ValidatedField<number>;
  rainProbability: ValidatedField<number>;
  uvIndex: ValidatedField<number>;
  aqiIndex: ValidatedField<number>;
  pm25: ValidatedField<number>;
  pm10: ValidatedField<number>;
  soilMoisture: ValidatedField<number>;
  visibilityKm: ValidatedField<number>;
  pressureMb: ValidatedField<number>;
  cloudCover: ValidatedField<number>;
  dewPoint: ValidatedField<number>;
  conditionText: ValidatedField<string>;
  conditionCode: ValidatedField<number>;
  isFrostAlert: ValidatedField<boolean>;
  source: string;
  timestamp: string;
  allValid: boolean;
  invalidCount: number;
  unavailableCount: number;
}

/**
 * Standard Meteorological & Physical Limits
 */
export const PHYSICAL_LIMITS = {
  TEMP_C: { min: -50, max: 60, unit: '°C' },
  HUMIDITY_PCT: { min: 0, max: 100, unit: '%' },
  WIND_KPH: { min: 0, max: 350, unit: 'km/h' },
  WIND_GUST_KPH: { min: 0, max: 400, unit: 'km/h' },
  RAINFALL_MM: { min: 0, max: 500, unit: 'mm' },
  RAIN_PROB_PCT: { min: 0, max: 100, unit: '%' },
  UV_INDEX: { min: 0, max: 18, unit: 'UV' },
  AQI_INDEX: { min: 0, max: 500, unit: 'AQI' },
  PM25: { min: 0, max: 1000, unit: 'µg/m³' },
  PM10: { min: 0, max: 1500, unit: 'µg/m³' },
  SOIL_MOISTURE_PCT: { min: 0, max: 100, unit: '%' },
  VISIBILITY_KM: { min: 0, max: 100, unit: 'km' },
  PRESSURE_MB: { min: 850, max: 1085, unit: 'hPa' },
  CLOUD_COVER_PCT: { min: 0, max: 100, unit: '%' },
  DEW_POINT_C: { min: -50, max: 45, unit: '°C' }
} as const;

export class DataValidatorService {
  /**
   * Validates a numeric environmental measurement against physical bounds and data validity.
   */
  static validateNumericField(
    rawValue: any,
    limits: { min: number; max: number; unit: string },
    fieldName: string
  ): ValidatedField<number> {
    // 1. Check for null / undefined / empty string
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return {
        value: null,
        raw: rawValue,
        unit: limits.unit,
        status: 'unavailable',
        statusReason: `${fieldName} is not provided in telemetry source`
      };
    }

    // 2. Parse number
    const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));

    // 3. Check for NaN, Infinity
    if (isNaN(num) || !isFinite(num)) {
      return {
        value: null,
        raw: rawValue,
        unit: limits.unit,
        status: 'invalid',
        statusReason: `${fieldName} contains non-numeric / NaN value: "${rawValue}"`
      };
    }

    // 4. Check common API sentinel error values (e.g. -999, -9999, 9999)
    if (num === -999 || num === -9999 || num === 9999 || num === -1) {
      // Note: -1 is only an error value if limits.min >= 0
      if (limits.min >= 0 && num < 0) {
        return {
          value: null,
          raw: rawValue,
          unit: limits.unit,
          status: 'unavailable',
          statusReason: `${fieldName} has API sentinel error code: ${num}`
        };
      }
    }

    // 5. Check physical range boundaries
    if (num < limits.min || num > limits.max) {
      return {
        value: null,
        raw: rawValue,
        unit: limits.unit,
        status: 'invalid',
        statusReason: `${fieldName} value ${num} is outside physical limits (${limits.min} to ${limits.max} ${limits.unit})`
      };
    }

    // 6. Valid measurement
    return {
      value: Math.round(num * 10) / 10,
      raw: rawValue,
      unit: limits.unit,
      status: 'valid'
    };
  }

  /**
   * Validates string / text metadata (e.g. condition description, wind direction).
   */
  static validateStringField(
    rawValue: any,
    defaultFallback: string,
    unit = ''
  ): ValidatedField<string> {
    if (rawValue === null || rawValue === undefined || typeof rawValue !== 'string' || rawValue.trim() === '') {
      return {
        value: defaultFallback || null,
        raw: rawValue,
        unit,
        status: defaultFallback ? 'unknown' : 'unavailable',
        statusReason: 'String field is empty or unpopulated'
      };
    }

    const trimmed = rawValue.trim();
    if (trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'unknown' || trimmed.toLowerCase() === 'null') {
      return {
        value: defaultFallback || null,
        raw: rawValue,
        unit,
        status: 'unavailable',
        statusReason: 'String field contains unavailable marker'
      };
    }

    return {
      value: trimmed,
      raw: rawValue,
      unit,
      status: 'valid'
    };
  }

  /**
   * Validates boolean flag values.
   */
  static validateBooleanField(rawValue: any, defaultFallback = false): ValidatedField<boolean> {
    if (rawValue === null || rawValue === undefined) {
      return {
        value: defaultFallback,
        raw: rawValue,
        unit: 'flag',
        status: 'unknown',
        statusReason: 'Boolean field unpopulated'
      };
    }

    const val = typeof rawValue === 'boolean' ? rawValue : Boolean(rawValue);
    return {
      value: val,
      raw: rawValue,
      unit: 'flag',
      status: 'valid'
    };
  }

  /**
   * Validates and normalizes complete raw weather response or telemetry payload
   * into a verified, strongly-typed environmental state.
   */
  static validateEnvironmentalData(raw: any, sourceName = 'weather_service'): ValidatedEnvironmentalState {
    if (!raw || typeof raw !== 'object') {
      return this.createEmptyState(sourceName, 'Raw payload is null or invalid object');
    }

    // Extract nested telemetry with fallback lookups
    const cur = raw.current || {};
    const cond = cur.condition || {};
    const aqi = raw.aqi || {};
    const agri = raw.agriculture || {};
    const details = raw.details || {};
    const loc = raw.location || {};

    const temperature = this.validateNumericField(
      cur.temp_c ?? raw.temp_c ?? details.temp_current_c,
      PHYSICAL_LIMITS.TEMP_C,
      'Temperature'
    );

    const feelsLike = this.validateNumericField(
      cur.feels_like_c ?? details.feels_like_c ?? (temperature.value !== null ? temperature.value : undefined),
      PHYSICAL_LIMITS.TEMP_C,
      'Feels Like'
    );

    const humidity = this.validateNumericField(
      cur.humidity ?? raw.humidity ?? details.humidity_pct,
      PHYSICAL_LIMITS.HUMIDITY_PCT,
      'Humidity'
    );

    const windSpeed = this.validateNumericField(
      cur.wind_kph ?? raw.wind_kph ?? details.wind_kph,
      PHYSICAL_LIMITS.WIND_KPH,
      'Wind Speed'
    );

    const windGust = this.validateNumericField(
      cur.wind_gust_kph ?? details.wind_gust_kph ?? (windSpeed.value !== null ? windSpeed.value : 0),
      PHYSICAL_LIMITS.WIND_GUST_KPH,
      'Wind Gust'
    );

    const windDirection = this.validateStringField(
      cur.wind_dir ?? details.wind_dir,
      'Variable',
      'dir'
    );

    const rainfall24h = this.validateNumericField(
      agri.rainfall_prediction_24h_mm ?? details.precip_24h_mm ?? raw.precip_mm,
      PHYSICAL_LIMITS.RAINFALL_MM,
      '24h Rainfall'
    );

    const rainfallHourly = this.validateNumericField(
      raw.precip_mm_hourly ?? (rainfall24h.value !== null ? rainfall24h.value / 24 : 0),
      PHYSICAL_LIMITS.RAINFALL_MM,
      'Hourly Rainfall'
    );

    const rainProbability = this.validateNumericField(
      raw.event_planner?.rain_probability_pct ?? raw.rain_probability_pct ?? 0,
      PHYSICAL_LIMITS.RAIN_PROB_PCT,
      'Rain Probability'
    );

    const uvIndex = this.validateNumericField(
      cur.uv ?? details.uv_index ?? raw.uv,
      PHYSICAL_LIMITS.UV_INDEX,
      'UV Index'
    );

    const aqiIndex = this.validateNumericField(
      aqi.index ?? details.aqi_index ?? raw.aqi_index,
      PHYSICAL_LIMITS.AQI_INDEX,
      'AQI Index'
    );

    const pm25 = this.validateNumericField(
      aqi.pm25 ?? details.aqi_pm25,
      PHYSICAL_LIMITS.PM25,
      'PM2.5'
    );

    const pm10 = this.validateNumericField(
      aqi.pm10 ?? details.aqi_pm10,
      PHYSICAL_LIMITS.PM10,
      'PM10'
    );

    const soilMoisture = this.validateNumericField(
      agri.soil_moisture_pct ?? raw.soil_moisture_pct,
      PHYSICAL_LIMITS.SOIL_MOISTURE_PCT,
      'Soil Moisture'
    );

    const visibilityKm = this.validateNumericField(
      cur.visibility_km ?? details.visibility_distance_km ?? raw.visibility_km,
      PHYSICAL_LIMITS.VISIBILITY_KM,
      'Visibility'
    );

    const pressureMb = this.validateNumericField(
      cur.pressure_mb ?? raw.pressure_mb,
      PHYSICAL_LIMITS.PRESSURE_MB,
      'Barometric Pressure'
    );

    const cloudCover = this.validateNumericField(
      details.cloud_cover_pct ?? raw.cloud_cover_pct ?? (cur.cloud !== undefined ? cur.cloud : 20),
      PHYSICAL_LIMITS.CLOUD_COVER_PCT,
      'Cloud Cover'
    );

    const dewPoint = this.validateNumericField(
      details.dew_point_c ?? (temperature.value !== null && humidity.value !== null 
        ? this.calculateDewPoint(temperature.value, humidity.value) 
        : undefined),
      PHYSICAL_LIMITS.DEW_POINT_C,
      'Dew Point'
    );

    const conditionText = this.validateStringField(
      cond.text ?? raw.condition ?? 'Partly Cloudy',
      'Partly Cloudy'
    );

    const conditionCode = this.validateNumericField(
      cond.code ?? 1000,
      { min: 1000, max: 1300, unit: 'code' },
      'Condition Code'
    );

    const isFrostAlert = this.validateBooleanField(
      agri.frost_alert ?? (temperature.value !== null && temperature.value <= 2),
      false
    );

    // Audit field validation summary
    const allFields = [
      temperature, feelsLike, humidity, windSpeed, rainfall24h,
      uvIndex, aqiIndex, soilMoisture, visibilityKm, pressureMb
    ];

    const invalidCount = allFields.filter(f => f.status === 'invalid').length;
    const unavailableCount = allFields.filter(f => f.status === 'unavailable').length;
    const allValid = invalidCount === 0 && unavailableCount === 0;

    return {
      location: {
        name: loc.name || 'Current Location',
        country: loc.country || 'India',
        region: loc.region,
        status: loc.name ? 'valid' : 'unknown'
      },
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      windGust,
      windDirection,
      rainfall24h,
      rainfallHourly,
      rainProbability,
      uvIndex,
      aqiIndex,
      pm25,
      pm10,
      soilMoisture,
      visibilityKm,
      pressureMb,
      cloudCover,
      dewPoint,
      conditionText,
      conditionCode,
      isFrostAlert,
      source: sourceName,
      timestamp: raw.timestamp || raw.location?.localTime || new Date().toISOString(),
      allValid,
      invalidCount,
      unavailableCount
    };
  }

  private static calculateDewPoint(temp_c: number, humidity: number): number {
    const a = 17.27;
    const b = 237.7;
    const h = Math.max(1, Math.min(100, humidity));
    const alpha = ((a * temp_c) / (b + temp_c)) + Math.log(h / 100);
    return Math.round(((b * alpha) / (a - alpha)) * 10) / 10;
  }

  private static createEmptyState(source: string, reason: string): ValidatedEnvironmentalState {
    const emptyField = (unit: string): ValidatedField<number> => ({
      value: null,
      raw: null,
      unit,
      status: 'unavailable',
      statusReason: reason
    });

    return {
      location: { name: 'Unknown', country: 'India', status: 'unavailable' },
      temperature: emptyField('°C'),
      feelsLike: emptyField('°C'),
      humidity: emptyField('%'),
      windSpeed: emptyField('km/h'),
      windGust: emptyField('km/h'),
      windDirection: { value: null, raw: null, unit: 'dir', status: 'unavailable', statusReason: reason },
      rainfall24h: emptyField('mm'),
      rainfallHourly: emptyField('mm'),
      rainProbability: emptyField('%'),
      uvIndex: emptyField('UV'),
      aqiIndex: emptyField('AQI'),
      pm25: emptyField('µg/m³'),
      pm10: emptyField('µg/m³'),
      soilMoisture: emptyField('%'),
      visibilityKm: emptyField('km'),
      pressureMb: emptyField('hPa'),
      cloudCover: emptyField('%'),
      dewPoint: emptyField('°C'),
      conditionText: { value: 'Unavailable', raw: null, unit: '', status: 'unavailable', statusReason: reason },
      conditionCode: emptyField('code'),
      isFrostAlert: { value: false, raw: null, unit: 'flag', status: 'unavailable', statusReason: reason },
      source,
      timestamp: new Date().toISOString(),
      allValid: false,
      invalidCount: 0,
      unavailableCount: 15
    };
  }
}

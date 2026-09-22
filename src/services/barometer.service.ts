// src/services/barometer.service.ts
// Barometric pressure monitoring & rapid drop detection

export interface PressureReading {
  timestamp: number;
  pressure_mb: number;
  cityKey?: string;
}

export class BarometerService {
  private static STORAGE_KEY = 'mausam_barometer_readings';

  static recordPressure(pressure_mb: number, cityKey?: string): void {
    if (typeof window === 'undefined' || !pressure_mb) return;
    try {
      const readings = this.getReadings();
      const now = Date.now();
      const cleanCity = (cityKey || 'default').toLowerCase();
      // Keep last 24h, filter out corrupt/invalid records
      const updated = [...readings, { timestamp: now, pressure_mb, cityKey: cleanCity }].filter(
        r => typeof r.timestamp === 'number' && typeof r.pressure_mb === 'number' && now - r.timestamp <= 24 * 60 * 60 * 1000
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  static getReadings(): PressureReading[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static getPressureTrend(current_mb: number, cityKey?: string): {
    delta3h: number;
    isRapidDrop: boolean;
    cycloneRisk: 'none' | 'moderate' | 'critical';
    trendText: string;
  } {
    const allReadings = this.getReadings();
    const cleanCity = (cityKey || 'default').toLowerCase();

    // Filter readings specifically for the current city/location to prevent cross-city false triggers
    const readings = allReadings.filter(r => (r.cityKey || 'default').toLowerCase() === cleanCity);

    if (readings.length < 2) {
      return { delta3h: 0, isRapidDrop: false, cycloneRisk: 'none', trendText: 'Barometric Trend Stable' };
    }

    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;

    // Only compare against readings recorded at least 15 seconds ago (to avoid immediate mock/load jitter) within last 3 hours
    const validPastReadings = readings.filter(r => r.timestamp >= threeHoursAgo && (now - r.timestamp) >= 15000);

    if (validPastReadings.length === 0) {
      return { delta3h: 0, isRapidDrop: false, cycloneRisk: 'none', trendText: 'Barometric Trend Stable' };
    }

    // Earliest reading within the 3-hour window
    const pastReading = validPastReadings[0];
    const delta = current_mb - pastReading.pressure_mb;

    let cycloneRisk: 'none' | 'moderate' | 'critical' = 'none';
    let isRapidDrop = false;

    // High threshold: drop of more than -15.0 hPa in 3h represents severe storm / cyclone danger
    // Moderate drop: drop between -6.0 and -15.0 hPa represents a rapid barometric watch
    // Minor variations (< 6 hPa) are typical diurnal/weather fluctuations and do not trigger cyclone alerts
    if (delta <= -15.0) {
      isRapidDrop = true;
      cycloneRisk = 'critical';
    } else if (delta <= -6.0) {
      isRapidDrop = true;
      cycloneRisk = 'moderate';
    }

    const trendText = cycloneRisk === 'critical'
      ? `Severe Pressure Plunge (${delta.toFixed(1)} hPa / 3h) - Cyclone Emergency`
      : cycloneRisk === 'moderate'
      ? `Rapid Drop (${delta.toFixed(1)} hPa / 3h) - Cyclone Watch`
      : delta > 1.0
      ? `Rising Pressure (+${delta.toFixed(1)} hPa / 3h)`
      : `Stable Pressure (${delta >= 0 ? '+' : ''}${delta.toFixed(1)} hPa / 3h)`;

    return {
      delta3h: Math.round(delta * 10) / 10,
      isRapidDrop,
      cycloneRisk,
      trendText
    };
  }
}


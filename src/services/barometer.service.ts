// src/services/barometer.service.ts
// Barometric pressure monitoring & rapid drop detection

export interface PressureReading {
  timestamp: number;
  pressure_mb: number;
}

export class BarometerService {
  private static STORAGE_KEY = 'mausam_barometer_readings';

  static recordPressure(pressure_mb: number): void {
    if (typeof window === 'undefined' || !pressure_mb) return;
    try {
      const readings = this.getReadings();
      const now = Date.now();
      const updated = [...readings, { timestamp: now, pressure_mb }].filter(
        r => now - r.timestamp <= 24 * 60 * 60 * 1000 // Keep last 24h
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

  static getPressureTrend(current_mb: number): {
    delta3h: number;
    isRapidDrop: boolean;
    cycloneRisk: 'none' | 'moderate' | 'critical';
    trendText: string;
  } {
    const readings = this.getReadings();
    if (readings.length < 2) {
      return { delta3h: 0, isRapidDrop: false, cycloneRisk: 'none', trendText: 'Barometric Trend Stable' };
    }

    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;
    const pastReading = readings.find(r => r.timestamp >= threeHoursAgo) || readings[0];
    const delta = current_mb - pastReading.pressure_mb;

    let cycloneRisk: 'none' | 'moderate' | 'critical' = 'none';
    let isRapidDrop = false;

    if (delta <= -3.0) {
      isRapidDrop = true;
      cycloneRisk = delta <= -5.0 ? 'critical' : 'moderate';
    }

    const trendText = isRapidDrop
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

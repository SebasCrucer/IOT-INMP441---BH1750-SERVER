import { BH1750Reading, INMP441Reading } from './api';

export enum AlertType {
  LIGHT_SPIKE = 'LIGHT_SPIKE',
  LIGHT_DROP = 'LIGHT_DROP',
  LIGHT_ABNORMAL = 'LIGHT_ABNORMAL',
  NOISE_SPIKE = 'NOISE_SPIKE',
  NOISE_OUTLIER = 'NOISE_OUTLIER',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  value?: number;
}

// Parámetros de configuración para detección de anomalías
const LIGHT_CONFIG = {
  SPIKE_THRESHOLD: 2.5, // Desviaciones estándar para considerar un pico
  DROP_THRESHOLD: 2.5,
  MIN_SAMPLES: 5, // Mínimo de muestras para calcular estadísticas
  EXPECTED_MIN: 50, // Lux mínimo esperado durante el día
  EXPECTED_MAX: 1000, // Lux máximo esperado
};

const NOISE_CONFIG = {
  OUTLIER_THRESHOLD: 3, // Desviaciones estándar para outliers
  SPIKE_THRESHOLD: 2.5,
  MIN_SAMPLES: 5,
  MAX_SAFE_AMPLITUDE: 30000, // Amplitud máxima segura
};

class AlertService {
  private alerts: Alert[] = [];

  // Calcula media y desviación estándar
  private calculateStats(values: number[]): { mean: number; std: number } {
    if (values.length === 0) return { mean: 0, std: 0 };
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    return { mean, std };
  }

  // Detecta anomalías en los datos de luz (BH1750)
  analyzeLightData(readings: BH1750Reading[]): Alert[] {
    const newAlerts: Alert[] = [];
    
    if (readings.length < LIGHT_CONFIG.MIN_SAMPLES) {
      return newAlerts;
    }

    // Obtener últimas lecturas para análisis
    const recentReadings = readings.slice(-20);
    const luxValues = recentReadings.map(r => r.lux);
    const { mean, std } = this.calculateStats(luxValues);

    // Verificar la última lectura
    const latest = readings[readings.length - 1];
    const zScore = std > 0 ? Math.abs((latest.lux - mean) / std) : 0;

    // Detectar pico de luz (posible intrusión o problema con iluminación)
    if (latest.lux > mean + LIGHT_CONFIG.SPIKE_THRESHOLD * std && zScore > LIGHT_CONFIG.SPIKE_THRESHOLD) {
      newAlerts.push({
        id: `light-spike-${latest.timestamp}`,
        type: AlertType.LIGHT_SPIKE,
        severity: AlertSeverity.WARNING,
        title: '⚠️ Pico de Luminosidad Detectado',
        message: `Nivel de luz anormal: ${latest.lux.toFixed(1)} lux (promedio: ${mean.toFixed(1)} lux). Posible intrusión o falla en iluminación.`,
        timestamp: latest.timestamp,
        value: latest.lux,
      });
    }

    // Detectar caída brusca de luz (posible corte de energía o problema)
    if (latest.lux < mean - LIGHT_CONFIG.DROP_THRESHOLD * std && zScore > LIGHT_CONFIG.DROP_THRESHOLD) {
      newAlerts.push({
        id: `light-drop-${latest.timestamp}`,
        type: AlertType.LIGHT_DROP,
        severity: AlertSeverity.CRITICAL,
        title: '🚨 Caída de Luminosidad Crítica',
        message: `Nivel de luz muy bajo: ${latest.lux.toFixed(1)} lux (promedio: ${mean.toFixed(1)} lux). Verificar sistema de iluminación.`,
        timestamp: latest.timestamp,
        value: latest.lux,
      });
    }

    // Detectar niveles anormales según el rango esperado
    if (latest.lux > LIGHT_CONFIG.EXPECTED_MAX) {
      newAlerts.push({
        id: `light-high-${latest.timestamp}`,
        type: AlertType.LIGHT_ABNORMAL,
        severity: AlertSeverity.WARNING,
        title: '⚡ Luminosidad Excesiva',
        message: `Nivel de luz superior al esperado: ${latest.lux.toFixed(1)} lux. Revisar sistema de control de luz.`,
        timestamp: latest.timestamp,
        value: latest.lux,
      });
    }

    return newAlerts;
  }

  // Detecta anomalías en los datos de audio (INMP441)
  analyzeNoiseData(readings: INMP441Reading[]): Alert[] {
    const newAlerts: Alert[] = [];
    
    if (readings.length < NOISE_CONFIG.MIN_SAMPLES) {
      return newAlerts;
    }

    // Calcular estadísticas de amplitud máxima de cada lectura
    const maxAmplitudes = readings.map(reading => {
      const samples = reading.samples as number[];
      return Math.max(...samples.map(s => Math.abs(s)));
    });

    const { mean, std } = this.calculateStats(maxAmplitudes);
    const latest = readings[readings.length - 1];
    const latestSamples = latest.samples as number[];
    const latestMaxAmplitude = Math.max(...latestSamples.map(s => Math.abs(s)));

    // Calcular Z-score
    const zScore = std > 0 ? Math.abs((latestMaxAmplitude - mean) / std) : 0;

    // Detectar pico de ruido (posible estrés en las gallinas, depredador, etc.)
    if (zScore > NOISE_CONFIG.SPIKE_THRESHOLD) {
      const severity = zScore > NOISE_CONFIG.OUTLIER_THRESHOLD ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
      newAlerts.push({
        id: `noise-spike-${latest.timestamp}`,
        type: AlertType.NOISE_SPIKE,
        severity,
        title: severity === AlertSeverity.CRITICAL ? '🚨 Ruido Crítico Detectado' : '⚠️ Ruido Elevado',
        message: `Nivel de ruido anormal: ${latestMaxAmplitude.toFixed(0)} (promedio: ${mean.toFixed(0)}). Posible estrés en las gallinas o amenaza.`,
        timestamp: latest.timestamp,
        value: latestMaxAmplitude,
      });
    }

    // Detectar outliers extremos
    if (latestMaxAmplitude > NOISE_CONFIG.MAX_SAFE_AMPLITUDE) {
      newAlerts.push({
        id: `noise-outlier-${latest.timestamp}`,
        type: AlertType.NOISE_OUTLIER,
        severity: AlertSeverity.CRITICAL,
        title: '🔊 Ruido Extremo Detectado',
        message: `Amplitud extremadamente alta: ${latestMaxAmplitude.toFixed(0)}. Revisar inmediatamente el gallinero.`,
        timestamp: latest.timestamp,
        value: latestMaxAmplitude,
      });
    }

    return newAlerts;
  }

  // Analiza todos los datos y retorna alertas combinadas
  analyzeAll(bh1750Data: BH1750Reading[], inmp441Data: INMP441Reading[]): Alert[] {
    const lightAlerts = this.analyzeLightData(bh1750Data);
    const noiseAlerts = this.analyzeNoiseData(inmp441Data);
    
    // Combinar alertas y mantener solo las últimas de cada tipo
    const allAlerts = [...lightAlerts, ...noiseAlerts];
    
    // Actualizar el estado de alertas (mantener las últimas 10)
    this.alerts = allAlerts.slice(-10);
    
    return this.alerts;
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

export const alertService = new AlertService();


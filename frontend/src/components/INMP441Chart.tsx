import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { INMP441Reading } from '../services/api';

interface INMP441ChartProps {
  data: INMP441Reading[];
}

export const INMP441Chart: React.FC<INMP441ChartProps> = ({ data }) => {
  // Procesar datos: mostrar la última lectura con sus muestras
  const latestReading = data.length > 0 ? data[data.length - 1] : null;

  // Para visualización histórica, calculamos estadísticas de cada lectura
  const historicalData = data.map((reading) => {
    const samples = reading.samples as number[];
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    const max = Math.max(...samples);
    const min = Math.min(...samples);
    return {
      time: new Date(reading.timestamp).toLocaleTimeString(),
      timestamp: reading.timestamp,
      promedio: avg,
      maximo: max,
      minimo: min,
    };
  });

  // Datos para visualizar la forma de onda de la última lectura
  const waveformData = latestReading
    ? (latestReading.samples as number[]).map((sample, index) => ({
        sample: index,
        amplitud: sample,
      }))
    : [];

  return (
    <div>
      {/* Gráfico histórico de estadísticas */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>
          INMP441 - Sensor de Audio (Estadísticas)
        </h2>
        {historicalData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis label={{ value: 'Amplitud', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload as { timestamp: string };
                    return new Date(data.timestamp).toLocaleString();
                  }
                  return value;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="promedio"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Promedio"
              />
              <Line
                type="monotone"
                dataKey="maximo"
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Máximo"
              />
              <Line
                type="monotone"
                dataKey="minimo"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Mínimo"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No hay datos disponibles
          </div>
        )}
      </div>

      {/* Gráfico de forma de onda de la última lectura */}
      {latestReading && (
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            Forma de Onda - Última Lectura ({new Date(latestReading.timestamp).toLocaleString()})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sample"
                label={{ value: 'Muestra', position: 'insideBottom', offset: -5 }}
              />
              <YAxis label={{ value: 'Amplitud', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amplitud"
                stroke="#8884d8"
                strokeWidth={1}
                dot={false}
                name="Amplitud"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};


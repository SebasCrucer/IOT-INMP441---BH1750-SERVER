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
import { BH1750Reading } from '../services/api';

interface BH1750ChartProps {
  data: BH1750Reading[];
}

export const BH1750Chart: React.FC<BH1750ChartProps> = ({ data }) => {
  const chartData = data.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString(),
    timestamp: reading.timestamp,
    lux: reading.lux,
  }));

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>BH1750 - Sensor de Luminosidad</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
            />
            <YAxis label={{ value: 'Lux', angle: -90, position: 'insideLeft' }} />
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
              dataKey="lux"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Luminosidad (Lux)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No hay datos disponibles
        </div>
      )}
    </div>
  );
};


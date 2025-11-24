import React, { useState, useEffect, useCallback } from 'react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { BH1750Chart } from './BH1750Chart';
import { INMP441Chart } from './INMP441Chart';
import { Filters } from './Filters';
import { AlertPanel } from './AlertPanel';
import { apiService, ReadingFilters, BH1750Reading, INMP441Reading } from '../services/api';
import { alertService, Alert } from '../services/alertService';

export const Dashboard: React.FC = () => {
  const { loading, error, connected, refetch } = useRealtimeData();
  const [filteredBH1750, setFilteredBH1750] = useState<BH1750Reading[]>([]);
  const [filteredINMP441, setFilteredINMP441] = useState<INMP441Reading[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadFilteredData = useCallback(async (filtersToApply: ReadingFilters) => {
    try {
      // Asegurar que siempre haya un límite (por defecto 10)
      const filtersWithLimit: ReadingFilters = {
        ...filtersToApply,
        limit: filtersToApply.limit || 10,
      };
      
      const [bh1750, inmp441] = await Promise.all([
        apiService.getBH1750Readings(filtersWithLimit),
        apiService.getINMP441Readings(filtersWithLimit),
      ]);
      setFilteredBH1750(bh1750.reverse());
      setFilteredINMP441(inmp441.reverse());
    } catch (err) {
      console.error('Error applying filters:', err);
    }
  }, []);

  // Cargar datos iniciales con límite por defecto
  useEffect(() => {
    if (!filtersApplied && !loading) {
      const initialFilters: ReadingFilters = { limit: 10 };
      loadFilteredData(initialFilters);
      setFiltersApplied(true);
    }
  }, [loading, filtersApplied, loadFilteredData]);

  const handleFilterChange = async (newFilters: ReadingFilters) => {
    // Asegurar que siempre haya un límite (por defecto 10)
    const filtersWithLimit: ReadingFilters = {
      ...newFilters,
      limit: newFilters.limit || 10,
    };
    
    await loadFilteredData(filtersWithLimit);
  };

  // Analizar datos y generar alertas
  useEffect(() => {
    if (filteredBH1750.length > 0 || filteredINMP441.length > 0) {
      const newAlerts = alertService.analyzeAll(filteredBH1750, filteredINMP441);
      setAlerts(newAlerts);
    }
  }, [filteredBH1750, filteredINMP441]);

  const handleClearAlerts = () => {
    alertService.clearAlerts();
    setAlerts([]);
  };

  if (loading && filteredBH1750.length === 0 && filteredINMP441.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Cargando datos...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '20px',
      }}>
        <div style={{ fontSize: '18px', color: '#d32f2f' }}>Error: {error}</div>
        <button
          onClick={refetch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{
        marginBottom: '30px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '10px' }}>
          🐓 Sistema de Monitoreo del Gallinero
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Control de calidad y detección de anomalías en tiempo real
        </p>
        <div style={{
          marginTop: '10px',
          fontSize: '14px',
          color: connected ? '#4caf50' : '#ff9800',
        }}>
          {connected ? '● Conectado (WebSocket)' : '○ Desconectado'}
        </div>
      </header>

      {/* Panel de Alertas - Parte Superior */}
      <AlertPanel alerts={alerts} onClearAlerts={handleClearAlerts} />

      {/* Filtros y Gráficos - Parte Inferior */}
      <Filters onFilterChange={handleFilterChange} />

      <BH1750Chart data={filteredBH1750} />
      <INMP441Chart data={filteredINMP441} />
    </div>
  );
};


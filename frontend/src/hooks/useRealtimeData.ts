import { useState, useEffect, useCallback } from 'react';
import { apiService, BH1750Reading, INMP441Reading } from '../services/api';
import { socketService } from '../services/socket';

export const useRealtimeData = () => {
  const [bh1750Data, setBH1750Data] = useState<BH1750Reading[]>([]);
  const [inmp441Data, setINMP441Data] = useState<INMP441Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setError(null);
      const [bh1750, inmp441] = await Promise.all([
        apiService.getBH1750Readings({ limit: 100 }),
        apiService.getINMP441Readings({ limit: 50 }),
      ]);

      setBH1750Data(bh1750.reverse()); // Reverse para mostrar más antiguos primero
      setINMP441Data(inmp441.reverse());
      setLoading(false);
    } catch (err: any) {
      // Solo mostrar error si es un error real de red, no si simplemente no hay datos
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      } else {
        // Si no hay datos, simplemente dejar arrays vacíos
        setBH1750Data([]);
        setINMP441Data([]);
        setError(null);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cargar datos iniciales
    fetchInitialData();

    // Configurar Socket.IO
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnected(false);
    });

    // Escuchar nuevos datos de BH1750
    const handleBH1750Update = (reading: BH1750Reading) => {
      setBH1750Data((prev) => {
        const updated = [reading, ...prev];
        return updated.slice(0, 100); // Mantener solo los últimos 100
      });
    };

    // Escuchar nuevos datos de INMP441
    const handleINMP441Update = (reading: INMP441Reading) => {
      setINMP441Data((prev) => {
        const updated = [reading, ...prev];
        return updated.slice(0, 50); // Mantener solo los últimos 50
      });
    };

    socketService.onBH1750Update(handleBH1750Update);
    socketService.onINMP441Update(handleINMP441Update);

    // Cleanup
    return () => {
      socketService.offBH1750Update(handleBH1750Update);
      socketService.offINMP441Update(handleINMP441Update);
      socketService.disconnect();
    };
  }, [fetchInitialData]);

  return { 
    bh1750Data, 
    inmp441Data, 
    loading, 
    error, 
    connected,
    refetch: fetchInitialData 
  };
};

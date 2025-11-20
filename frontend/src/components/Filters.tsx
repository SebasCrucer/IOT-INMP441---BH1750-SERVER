import React from 'react';

interface FiltersProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [limit, setLimit] = React.useState<number | ''>(10);

  React.useEffect(() => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit: limit ? Number(limit) : 10, // Siempre aplicar límite, por defecto 10
    });
  }, [startDate, endDate, limit, onFilterChange]);

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setLimit(10); // Mantener límite por defecto de 10
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Filtros</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        alignItems: 'end',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
            Fecha Inicio
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
            Fecha Fin
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
            Límite de Registros
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value ? Number(e.target.value) : 10)}
            placeholder="10"
            min="1"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <button
            onClick={handleClear}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};


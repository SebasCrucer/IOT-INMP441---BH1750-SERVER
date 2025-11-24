import React from 'react';
import { Alert, AlertSeverity } from '../services/alertService';

interface AlertPanelProps {
  alerts: Alert[];
  onClearAlerts?: () => void;
}

const getSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return '#d32f2f';
    case AlertSeverity.WARNING:
      return '#f57c00';
    case AlertSeverity.INFO:
      return '#1976d2';
    default:
      return '#666';
  }
};

const getSeverityBackground = (severity: AlertSeverity): string => {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return '#ffebee';
    case AlertSeverity.WARNING:
      return '#fff3e0';
    case AlertSeverity.INFO:
      return '#e3f2fd';
    default:
      return '#f5f5f5';
  }
};

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onClearAlerts }) => {
  // Filtrar alertas únicas por ID
  const uniqueAlerts = alerts.filter((alert, index, self) =>
    index === self.findIndex((a) => a.id === alert.id)
  );

  // Ordenar por timestamp (más recientes primero)
  const sortedAlerts = [...uniqueAlerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Separar por severidad
  const criticalAlerts = sortedAlerts.filter(a => a.severity === AlertSeverity.CRITICAL);
  const warningAlerts = sortedAlerts.filter(a => a.severity === AlertSeverity.WARNING);

  const hasAlerts = sortedAlerts.length > 0;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      marginBottom: '30px',
      border: hasAlerts ? '2px solid #ff9800' : '2px solid #e0e0e0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '15px',
      }}>
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            color: '#333', 
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            🐓 Sistema de Alertas del Gallinero
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Monitoreo automático de condiciones anormales
          </p>
        </div>
        {hasAlerts && onClearAlerts && (
          <button
            onClick={onClearAlerts}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
          >
            Limpiar Alertas
          </button>
        )}
      </div>

      {/* Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: criticalAlerts.length > 0 ? '#ffebee' : '#f5f5f5',
          borderRadius: '8px',
          border: `2px solid ${criticalAlerts.length > 0 ? '#d32f2f' : '#e0e0e0'}`,
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '5px' }}>
            {criticalAlerts.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Alertas Críticas</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: warningAlerts.length > 0 ? '#fff3e0' : '#f5f5f5',
          borderRadius: '8px',
          border: `2px solid ${warningAlerts.length > 0 ? '#f57c00' : '#e0e0e0'}`,
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f57c00', marginBottom: '5px' }}>
            {warningAlerts.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Advertencias</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
          border: `2px solid ${hasAlerts ? '#f57c00' : '#4caf50'}`,
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: hasAlerts ? '#f57c00' : '#4caf50', marginBottom: '5px' }}>
            {hasAlerts ? '⚠️' : '✓'}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {hasAlerts ? 'Requiere Atención' : 'Todo Normal'}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {hasAlerts ? (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          {sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: getSeverityBackground(alert.severity),
                borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                borderRadius: '4px',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '8px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getSeverityColor(alert.severity),
                }}>
                  {alert.title}
                </h3>
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  backgroundColor: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  marginLeft: '10px',
                }}>
                  {new Date(alert.timestamp).toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.5',
              }}>
                {alert.message}
              </p>
              {alert.value !== undefined && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: 'monospace',
                }}>
                  Valor registrado: {alert.value.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          color: '#999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✨</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50', marginBottom: '5px' }}>
            Sin Alertas Activas
          </div>
          <div style={{ fontSize: '14px' }}>
            Todas las condiciones del gallinero están dentro de los parámetros normales
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center',
      }}>
        El sistema analiza automáticamente los niveles de luz y ruido para detectar anomalías
      </div>
    </div>
  );
};


import React, {useState, useEffect} from 'react';
import { getPartidasAnteriores } from '../services/api';
import type { RunTrabajo } from '../types';


interface HistorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  isJubilacion?: boolean;
  finalRun?: RunTrabajo | null;
  idUsuario: string;
}

interface HistorialItem {
  id: string;
  userId?: number;
  dineroGenerado: number;
  fecha: string;
  edadActual?: number;
  estado: string;
}

export const HistorialModal: React.FC<HistorialModalProps> = ({
    isOpen,
    onClose,
    isJubilacion,
    finalRun,
    idUsuario
}) => {
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [playerPosition, setPlayerPosition] = useState<number | null>(null);
    const esMuerto = finalRun?.estado === 'MUERTO' || finalRun?.muerto;

    useEffect(() => {
        if (isOpen) {
          setLoading(true);
          getPartidasAnteriores(idUsuario)
            .then((data) => {
              const normalized = data
                .map((item, index) => ({
                  id: item.id || `rank-${index}`,
                  dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
                  edadActual: item.edadActual || 65,
                  fecha: item.fecha,
                  estado: item.estado || 'Finalizada'
                    
                }))
                .sort((a, b) => b.dineroGenerado - a.dineroGenerado);
    
              setHistorial(normalized);
    
              if (finalRun) {
                const pos = normalized.findIndex(
                  (r) => r.dineroGenerado <= finalRun.dineroGenerado
                );
                setPlayerPosition(pos !== -1 ? pos + 1 : normalized.length + 1);
              }
            })
            .finally(() => setLoading(false));
        }
      }, [isOpen, finalRun]);
    
      if (!isOpen) return null;
    
      return (
        <div className="modal-overlay">
          <div className="modal-card ranking-modal-card">
            <div className="ranking-header">
              
                <h2>🏆 Historial de partidas</h2>
              
            </div>
    
            {(isJubilacion) && finalRun && (
              <div className="career-summary-box">
                <div className="summary-top-row">
    
                  <div className="summary-stats-column">
                    <div className="summary-pill highlight-rank">
                      <span className="summary-label">Posición en el Ranking Global</span>
                      <span className="summary-value">#{playerPosition || 1}</span>
                    </div>
    
                    <div className="summary-pill">
                      <span className="summary-label">Dinero Acumulado Total</span>
                      <span className="summary-value">${finalRun.dineroGenerado.toLocaleString()}</span>
                    </div>
    
                    <div className="summary-pill">
                      <span className="summary-label">Estado Final / Edad</span>
                      <span className="summary-value">{finalRun.edadActual} Años ({esMuerto ? '💀 MUERTO' : '🏁 JUBILADO'})</span>
                    </div>
                  </div>
                </div>
    
              </div>
            )}
    
            <h3 className="leaderboard-title">📊 Partidas Anteriores</h3>
    
            {loading ? (
              <div className="modal-spinner">Cargando posiciones del servidor...</div>
            ) : (
              <div className="ranking-table-wrapper">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Edad Final</th>
                      <th>Patrimonio Generado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item, index) => {
                      return (
                        <tr key={item.id} className={index < 3 ? 'top-rank' : ''}>
                          <td className="rank-position">{new Date(item.fecha).toLocaleDateString('es-ES') }</td>
                          <td>{item.estado === 'MUERTO' ? '💀' : 'Jubilado'}</td>
                          <td className="rank-user">{item.edadActual}</td>
                          <td className="rank-money">${item.dineroGenerado.toLocaleString()}</td>
                          <td className='rank-money'><button className="btn btn-secondary btn-sm">Detalles</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
    
            <div className="ranking-modal-actions">
              <button className="btn btn-primary" onClick={onClose}>
                {isJubilacion || esMuerto ? 'Volver al Menú Principal' : 'Cerrar Ranking'}
              </button>
            </div>
          </div>
        </div>
      );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPartidasAnteriores } from '../services/api';
import type { RunTrabajo } from '../types';
import {
  primerPuestoSticker,
  segundoPuestoSticker,
  tercerPuestoSticker,
} from '../assets';

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
  fecha?: string;
  edadActual?: number;
  estado: string;
}

export const HistorialModal: React.FC<HistorialModalProps> = ({
  isOpen,
  onClose,
  isJubilacion,
  finalRun,
  idUsuario,
}) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getPartidasAnteriores(idUsuario)
        .then((data) => {
          const normalized = data
            .map((item, index) => ({
              id: item.id || `hist-${index}`,
              dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
              edadActual: item.edadActual || 65,
              fecha: item.fecha,
              estado: item.estado || 'Completada',
            }))
            .sort((a, b) => b.dineroGenerado - a.dineroGenerado);

          setHistorial(normalized);

          if (finalRun) {
            const pos = normalized.findIndex((r) => r.dineroGenerado <= finalRun.dineroGenerado);
            setPlayerPosition(pos !== -1 ? pos + 1 : normalized.length + 1);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, finalRun, idUsuario]);

  if (!isOpen) return null;

  const getMedalSticker = (index: number) => {
    if (index === 0) return <img src={primerPuestoSticker} alt="1st" className="medal-sticker-img" />;
    if (index === 1) return <img src={segundoPuestoSticker} alt="2nd" className="medal-sticker-img" />;
    if (index === 2) return <img src={tercerPuestoSticker} alt="3rd" className="medal-sticker-img" />;
    return `#${index + 1}`;
  };

  

  return (
    <div className="modal-overlay">
      <div className="modal-card ranking-modal-card">
        <div className="ranking-header">
          <h2>HISTORIAL DE PARTIDAS PERSONALES</h2>
        </div>

        {isJubilacion && finalRun && (
          <div className="career-summary-box">
            <div className="summary-top-row">
              <div className="summary-stats-column">
                <div className="summary-pill highlight-rank-frame">
                  <span className="summary-label">Posición en el Historial</span>
                  <span className="summary-value">#{playerPosition || 1}</span>
                </div>

                <div className="summary-pill">
                  <span className="summary-label">Dinero Acumulado Total</span>
                  <span className="summary-value">${finalRun.dineroGenerado.toLocaleString()}</span>
                </div>

                <div className="summary-pill">
                  <span className="summary-label">Estado Final / Edad</span>
                  <span className="summary-value">
                    {finalRun.edadActual} Años ({finalRun.edadActual < 65 ? 'Muerto': 'Jubilado'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <h3 className="leaderboard-title">Tus Partidas Anteriores</h3>

        {loading ? (
          <div className="modal-spinner">Cargando partidas anteriores...</div>
        ) : (
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Patrimonio Generado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, index) => {
                  const dateStr = item.fecha
                    ? new Date(item.fecha).toLocaleDateString('es-ES')
                    : 'Histórico';

                  return (
                    <tr key={item.id} className={index < 3 ? 'top-rank' : ''}>
                      <td className="rank-position">{getMedalSticker(index)}</td>
                      <td>{dateStr}</td>
                      <td className="rank-money">${item.dineroGenerado.toLocaleString()}</td>
                      <td>
                        <button className='btn' onClick={ () => navigate(`/historial/${item.id}`)}>
                          Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="ranking-modal-actions">
          <button className="btn-ranking-close" onClick={onClose}>
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
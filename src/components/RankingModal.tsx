import React, { useEffect, useState } from 'react';
import { getRankingGlobal } from '../services/api';
import type { RunTrabajo, Habilidad } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isJubilacion?: boolean;
  finalRun?: RunTrabajo | null;
  finalHabilidades?: Habilidad[];
}

interface RankingItem {
  id: string;
  username?: string;
  userId?: string;
  dineroGenerado: number;
  edadActual?: number;
  estado?: string;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  isJubilacion,
  finalRun,
  finalHabilidades = [],
}) => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);

  const esMuerto = finalRun?.estado === 'MUERTO' || finalRun?.muerto;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getRankingGlobal()
        .then((data) => {
          const normalized = data
            .map((item, index) => ({
              id: item.id || `rank-${index}`,
              username: item.username || item.userId || `Jugador #${index + 1}`,
              dineroGenerado: typeof item.dineroGenerado === 'number' ? item.dineroGenerado : 0,
              edadActual: item.edadActual || 65,
              estado: item.estado || 'FINALIZADA',
            }))
            .sort((a, b) => b.dineroGenerado - a.dineroGenerado);

          setRanking(normalized);

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
          {isJubilacion || esMuerto ? (
            <div className={esMuerto ? 'jubilacion-banner dead-banner' : 'jubilacion-banner'}>
              <h2>{esMuerto ? '💀 PARTIDA FINALIZADA — PERSONAJE FALLECIDO 💀' : '🏁 PARTIDA FINALIZADA — JUBILACIÓN CUMPLIDA 🏁'}</h2>
              <p>{esMuerto ? 'Tu trayectoria profesional concluyó de forma abrupta antes de tiempo.' : 'Has completado tu carrera laboral con éxito a los 65 años en LaburoYHambre.'}</p>
            </div>
          ) : (
            <h2>🏆 TABLA DE POSICIONES GLOBAL</h2>
          )}
        </div>

        {(isJubilacion || esMuerto) && finalRun && (
          <div className="career-summary-box">
            <div className="summary-top-row">
              <div className="summary-avatar-wrapper">
                <PlayerAvatar edadActual={finalRun.edadActual} dineroGenerado={finalRun.dineroGenerado} />
              </div>

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

            {/* HABILIDADES FINALES */}
            <div className="summary-skills-section">
              <h4>⚡ Nivel Final de Habilidades Alcanzadas</h4>
              <div className="summary-skills-grid">
                {finalHabilidades.map((hab) => (
                  <div key={hab.id || hab._id} className="summary-skill-chip">
                    <span className="summary-skill-name">{hab.nombre}</span>
                    <span className="summary-skill-level">{hab.nivel || 0} / 10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <h3 className="leaderboard-title">📊 Clasificación General de Jugadores</h3>

        {loading ? (
          <div className="modal-spinner">Cargando posiciones del servidor...</div>
        ) : (
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Jugador</th>
                  <th>Edad Final</th>
                  <th>Patrimonio Generado</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((item, index) => {
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                  return (
                    <tr key={item.id} className={index < 3 ? 'top-rank' : ''}>
                      <td className="rank-position">{medal}</td>
                      <td className="rank-user">{item.username}</td>
                      <td>{item.edadActual} años {item.estado === 'MUERTO' ? '💀' : ''}</td>
                      <td className="rank-money">${item.dineroGenerado.toLocaleString()}</td>
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
};

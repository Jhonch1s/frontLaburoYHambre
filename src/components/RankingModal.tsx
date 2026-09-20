import React, { useEffect, useState } from 'react';
import { getRankingGlobal } from '../services/api';
import type { RunTrabajo, Habilidad } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { useAuth } from '../context/AuthContext';
import {
  primerPuestoSticker,
  segundoPuestoSticker,
  tercerPuestoSticker,
} from '../assets';

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
  const { user } = useAuth();

  const esMuerto = finalRun?.estado === 'MUERTO' || finalRun?.muerto;
  const esResultado = isJubilacion || esMuerto;

  useEffect(() => {
    if (isOpen && !esResultado) {
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
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, esResultado]);

  if (!isOpen) return null;

  const modalFrameClass = esMuerto
    ? 'muerte-frame'
    : isJubilacion
    ? 'jubilacion-frame'
    : '';

  const getMedalSticker = (index: number) => {
    if (index === 0) return <img src={primerPuestoSticker} alt="1st" className="medal-sticker-img" />;
    if (index === 1) return <img src={segundoPuestoSticker} alt="2nd" className="medal-sticker-img" />;
    if (index === 2) return <img src={tercerPuestoSticker} alt="3rd" className="medal-sticker-img" />;
    return `#${index + 1}`;
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-card ranking-modal-card ${modalFrameClass}`}>
        {esResultado ? (
          /* RESULTADO JUBILACIÓN / MUERTE COMPACTO DENTRO DEL MARCO */
          <div className="result-modal-container">
            <div className="result-header-row">
              <div className="result-avatar-box">
                <PlayerAvatar edadActual={finalRun?.edadActual || 65} dineroGenerado={finalRun?.dineroGenerado || 0} />
              </div>

              <div className="result-main-details">
                <h2 className="result-player-name">{user?.username || 'Desarrollador'}</h2>
                <div className="result-stat-line">
                  <span className="result-stat-label">Patrimonio Generado:</span>
                  <span className="result-stat-money">${(finalRun?.dineroGenerado || 0).toLocaleString()}</span>
                </div>
                <div className="result-stat-line">
                  <span className="result-stat-label">Estado Final:</span>
                  <span className={`result-stat-status ${esMuerto ? 'dead' : 'retired'}`}>
                    {finalRun?.edadActual || 65} Años - {esMuerto ? 'FALLECIDO' : 'JUBILADO'}
                  </span>
                </div>
              </div>
            </div>

            {/* HABILIDADES FINALES SUPER COMPACTAS */}
            {finalHabilidades.length > 0 && (
              <div className="result-skills-compact">
                <h4 className="result-skills-title">Habilidades Alcanzadas</h4>
                <div className="result-skills-grid">
                  {finalHabilidades.map((hab) => (
                    <div key={hab.id || hab._id} className="result-skill-tag">
                      <span className="skill-tag-name">{hab.nombre}</span>
                      <span className="skill-tag-level">{hab.nivel || 0}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CLASIFICACIÓN GENERAL GLOBAL (DESDE EL MENÚ PRINCIPAL) */
          <>
            <div className="ranking-header">
              <h2>TABLA DE POSICIONES GLOBAL</h2>
            </div>

            <h3 className="leaderboard-title">Clasificación General de Jugadores</h3>

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
                    {ranking.map((item, index) => (
                      <tr key={item.id} className={index < 3 ? 'top-rank' : ''}>
                        <td className="rank-position">{getMedalSticker(index)}</td>
                        <td className="rank-user">{item.username}</td>
                        <td>{item.edadActual} años {item.estado === 'MUERTO' ? '(Fallecido)' : ''}</td>
                        <td className="rank-money">${item.dineroGenerado.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="ranking-modal-actions">
              <button className="btn-ranking-close" onClick={onClose}>
                Cerrar Ranking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

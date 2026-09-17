import React from 'react';
import type { Evento, OpcionEvento } from '../types';

interface EventModalProps {
  evento: Evento | null;
  onSelectOption: (opcionId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ evento, onSelectOption }) => {
  if (!evento) return null;

  const renderEfectos = (opcion: OpcionEvento) => {
    // Si la opción posee relación con Efectos de MongoDB (EfectoOpcion / Efecto)
    if (opcion.efectos && opcion.efectos.length > 0) {
      return opcion.efectos
        .map((ef) => `${ef.valor > 0 ? '+' : ''}${ef.valor} ${ef.objetivo}`)
        .join(', ');
    }

    // Fallback si viene mapeado como objeto o string
    const impacto = opcion.impactoHab;
    if (typeof impacto === 'string') return impacto;
    if (Array.isArray(impacto)) {
      return impacto.map((i) => `+${i.incremento} ${i.habilidad}`).join(', ');
    }
    if (typeof impacto === 'object' && impacto !== null) {
      return Object.entries(impacto)
        .map(([hab, inc]) => `${inc > 0 ? '+' : ''}${inc} ${hab}`)
        .join(', ');
    }
    return '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card event-modal-card">
        <div className="event-modal-header">
          <span className="event-badge">⚠️ EVENTO DE CARRERA</span>
          <h2>{evento.titulo}</h2>
        </div>
        <p className="event-description">{evento.descripcion}</p>

        <div className="event-options-list">
          {evento.opciones.map((opcion) => {
            const opcionId = opcion._id || opcion.id || '';
            const efectosText = renderEfectos(opcion);
            const dinero = opcion.impactoDinero || 0;

            return (
              <button
                key={opcionId}
                className="event-option-button"
                onClick={() => onSelectOption(opcionId)}
              >
                <span className="option-text">{opcion.texto}</span>
                <div className="option-impacts">
                  {efectosText && <span className="impact-skill">⚡ {efectosText}</span>}
                  {dinero !== 0 && (
                    <span className="impact-money">
                      {dinero > 0 ? `+$${dinero.toLocaleString()}` : `-$${Math.abs(dinero).toLocaleString()}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

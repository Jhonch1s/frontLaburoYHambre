import React from 'react';
import type { Evento } from '../types';

interface EventModalProps {
  evento: Evento | null;
  onSelectOption: (opcionId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ evento, onSelectOption }) => {
  if (!evento) return null;

  const isMuerte = evento.tipo === 'MUERTE';

  return (
    <div className="modal-overlay">
      <div className="modal-card event-modal-card-frame">
        <div className="event-modal-header">
          <div className='event-modal-header-container'>
            <span className="event-badge">
              {isMuerte ? 'EVENTO CRÍTICO' : 'EVENTO DE CARRERA'}
            </span>
          </div>
          <h2 className='evento-titulo'>{evento.titulo}</h2>
        </div>
        <p className="event-description">{evento.descripcion}</p>

        <div className="event-options-list">
          {evento.opciones.map((opcion, idx) => {
            const opcionId = opcion._id || opcion.id || '';
            const frameClass = idx === 0 ? 'option-frame-1' : 'option-frame-2';

            return (
              <button
                key={opcionId}
                className={`event-option-button ${frameClass}`}
                onClick={() => onSelectOption(opcionId)}
              >
                <span className="option-text">{opcion.texto}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


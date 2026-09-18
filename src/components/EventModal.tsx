import React from 'react';
import type { Evento, OpcionEvento } from '../types';
import { eventoMuerteSticker, cincoEstrellasSticker } from '../assets';

interface EventModalProps {
  evento: Evento | null;
  onSelectOption: (opcionId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ evento, onSelectOption }) => {
  if (!evento) return null;

  const isMuerte = evento.tipo === 'MUERTE';
  const isPositivoExtremo = (evento.probabilidad && evento.probabilidad < 0.1) || (evento.titulo && evento.titulo.toLowerCase().includes('curso'));

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
      <div className="modal-card event-modal-card-frame">
        <div className="event-modal-header">
          <div className='event-modal-header-container'>
            <span className="event-badge">
              {isMuerte ? 'EVENTO CRÍTICO' : 'EVENTO DE CARRERA'}
            </span>
            {isMuerte ? (
              <img src={eventoMuerteSticker} alt="Muerte" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            ) : isPositivoExtremo ? (
              <img src={cincoEstrellasSticker} alt="Star" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            ) : null}
          </div>
          <h2 className='evento-titulo'>{evento.titulo}</h2>
        </div>
        <p className="event-description">{evento.descripcion}</p>

        <div className="event-options-list">
          {evento.opciones.map((opcion, idx) => {
            const opcionId = opcion._id || opcion.id || '';
            const efectosText = renderEfectos(opcion);
            const dinero = opcion.impactoDinero || 0;
            const frameClass = idx === 0 ? 'option-frame-1' : 'option-frame-2';

            return (
              <button
                key={opcionId}
                className={`event-option-button ${frameClass}`}
                onClick={() => onSelectOption(opcionId)}
              >
                <span className="option-text">{opcion.texto}</span>
                <div className="option-impacts">
                  {efectosText && <span className="impact-skill">{efectosText}</span>}
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


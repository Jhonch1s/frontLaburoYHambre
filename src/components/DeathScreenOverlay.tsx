import React from 'react';
import { fantasmaSticker } from '../assets';

interface DeathScreenOverlayProps {
  isOpen: boolean;
  causeOfDeath?: string;
  onContinue: () => void;
}

export const DeathScreenOverlay: React.FC<DeathScreenOverlayProps> = ({
  isOpen,
  causeOfDeath,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dark-souls-overlay">
      <div className="dark-souls-content">
        <img src={fantasmaSticker} alt="Fantasma Muerte" className="fantasma-sticker-img" />

        <div className="dark-souls-banner">
          <h1 className="you-died-title">HAS MUERTO</h1>
          <div className="dark-souls-line" />
          <p className="cause-of-death">
            {causeOfDeath || 'Tu carrera profesional ha llegado a un desenlace trágico.'}
          </p>
        </div>

        <button className="btn-dark-souls" onClick={onContinue}>
          Ver Clasificación Final de Carrera
        </button>
      </div>
    </div>
  );
};


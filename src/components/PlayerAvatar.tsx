import React from 'react';

interface PlayerAvatarProps {
  edadActual: number;
  dineroGenerado: number;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ edadActual, dineroGenerado }) => {
  // Determinar grupo de edad (<30, 30-50, >50)
  let ageGroup = 'Joven (Junior)';
  let ageBadge = '🌱';
  if (edadActual >= 30 && edadActual <= 50) {
    ageGroup = 'Senior (Mid-Career)';
    ageBadge = '⚡';
  } else if (edadActual > 50) {
    ageGroup = 'Veterano (Executive)';
    ageBadge = '👑';
  }

  // Determinar rango de riqueza (<$50k, $50k-$500k, >$500k)
  let wealthGroup = 'En Crecimiento (< $50k)';
  let avatarThemeClass = 'avatar-tier-low';
  let iconSymbol = '🧑‍💻';

  if (dineroGenerado >= 50000 && dineroGenerado <= 500000) {
    wealthGroup = 'Consolidado ($50k - $500k)';
    avatarThemeClass = 'avatar-tier-mid';
    iconSymbol = '👔';
  } else if (dineroGenerado > 500000) {
    wealthGroup = 'Magnate Tech (> $500k)';
    avatarThemeClass = 'avatar-tier-high';
    iconSymbol = '💎';
  }

  return (
    <div className={`player-avatar-card ${avatarThemeClass}`}>
      <div className="avatar-frame">
        <span className="avatar-icon">{iconSymbol}</span>
        <span className="age-badge">{ageBadge}</span>
      </div>
      <div className="avatar-info">
        <h4 className="avatar-title">{ageGroup}</h4>
        <p className="avatar-wealth">{wealthGroup}</p>
        <span className="avatar-tag">Nivel de Carrera</span>
      </div>
    </div>
  );
};

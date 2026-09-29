import React from 'react';
import {
  jovenPobre,
  jovenModerado,
  jovenRico,
  adultoPobre,
  adultoModerado,
  adultoRico,
  viejoPobre,
  viejoModerado,
  viejoRico,
  muerto
} from '../assets';

interface PlayerAvatarProps {
  edadActual: number;
  dineroGenerado: number;
  estaMuerto: Boolean
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ edadActual, dineroGenerado, estaMuerto }) => {
  // 1. Determinar Franja de Edad (Joven: 18-30, Adulto: 31-50, Viejo: 51-65)
  const isJoven = edadActual <= 30;
  const isAdulto = edadActual > 30 && edadActual <= 50;


  // 2. Determinar Nivel Económico (Pobre: < 500k, Moderado: 500k - 2M, Rico: > 2M)
  const isPobre = dineroGenerado < 500000;
  const isModerado = dineroGenerado >= 500000 && dineroGenerado <= 2000000;
  // const isRico = dineroGenerado > 2000000;

  // 3. Selección de Asset de Personaje .NET
  let avatarImg = jovenPobre;
  let ageLabel = 'Joven (18-30 Años)';
  let wealthLabel = 'Nivel Económico: Inicial (< $500k)';

  if (estaMuerto) {
    avatarImg = muerto;
    ageLabel = 'Falleció a los '+edadActual+' años';
    if (isPobre) {
      wealthLabel = 'Murio pobre (< $500k)';
    } else if (isModerado) {
      wealthLabel = 'Tenia Potencial ($500k - $2M)';
    } else {
      wealthLabel = 'Ni pudo usar la plata xddd (> $2M)';
    }
  } else {
    if (isJoven) {
      if (isPobre) {
        avatarImg = jovenPobre;
        wealthLabel = 'Desarrollador Inicial (< $500k)';
      } else if (isModerado) {
        avatarImg = jovenModerado;
        wealthLabel = 'Ingresos Moderados ($500k - $2M)';
      } else {
        avatarImg = jovenRico;
        wealthLabel = 'Joven Promesa Tech (> $2M)';
      }
    } else if (isAdulto) {
      ageLabel = 'Adulto (31-50 Años)';
      if (isPobre) {
        avatarImg = adultoPobre;
        wealthLabel = 'Desarrollador Cansado (< $500k)';
      } else if (isModerado) {
        avatarImg = adultoModerado;
        wealthLabel = 'Profesional Estabilizado ($500k - $2M)';
      } else {
        avatarImg = adultoRico;
        wealthLabel = 'Empresario / Senior Lead (> $2M)';
      }
    } else {
      ageLabel = 'Veterano (51-65 Años)';
      if (isPobre) {
        avatarImg = viejoPobre;
        wealthLabel = 'Veterano Ajustado (< $500k)';
      } else if (isModerado) {
        avatarImg = viejoModerado;
        wealthLabel = 'Jubilado Cómodo ($500k - $2M)';
      } else {
        avatarImg = viejoRico;
        wealthLabel = 'Magnate Tech Senior (> $2M)';
      }
    }
  }



  return (
    <div className="player-avatar-frame-card">
      <div className="avatar-direct-wrapper">
        <img src={avatarImg} alt={ageLabel} className="avatar-net-image-direct" />
      </div>
      <div className="avatar-info">
        <h4 className="avatar-title">{ageLabel}</h4>
        <p className="avatar-wealth">{wealthLabel}</p>
      </div>
    </div>
  );
};


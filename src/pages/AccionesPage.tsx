import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRunActiva, crearRun } from '../services/api';
import type { RunTrabajo } from '../types';
import { RankingModal } from '../components/RankingModal';
import { HistorialModal } from '../components/HistorialModal';
import { logoLaburoYHambre } from '../assets';
import { Footer } from '../components/Footer';

export const AccionesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeRun, setActiveRun] = useState<RunTrabajo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRanking, setShowRanking] = useState<boolean>(false);
  const [showHistorial, setShowHistorial] = useState<boolean>(false);

 

 


  return (
    <div className="menu-container">
      <header className="menu-header">
        <img src={logoLaburoYHambre} alt="LaburoYHambre" className="menu-logo-img" />
        <div className="user-welcome">
          <span>Bienvenido, <strong>{user?.username || 'Desarrollador'}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-header">
            Regresar a menu
          </button>
          <button className="btn-header" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      

      <Footer />
    </div>
  );
};


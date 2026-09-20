import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRunActiva, crearRun } from '../services/api';
import type { RunTrabajo } from '../types';
import { RankingModal } from '../components/RankingModal';
import { HistorialModal } from '../components/HistorialModal';
import { logoLaburoYHambre } from '../assets';
import { Footer } from '../components/Footer';

export const MainMenuPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeRun, setActiveRun] = useState<RunTrabajo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRanking, setShowRanking] = useState<boolean>(false);
  const [showHistorial, setShowHistorial] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getRunActiva(user.id)
        .then((run) => {
          if (run && run.estado === 'ACTIVA') {
            setActiveRun(run);
          } else {
            setActiveRun(null);
          }
        })
        .catch(() => setActiveRun(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleStartNewGame = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const newRun = await crearRun(user.id, 1);
      setActiveRun(null);
      navigate('/game', { state: { targetRun: newRun, isNew: true } });
    } catch (err) {
      console.error('Error al iniciar nueva partida:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGame = () => {
    if (activeRun) {
      navigate('/game', { state: { targetRun: activeRun, isNew: false } });
    }
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <img src={logoLaburoYHambre} alt="LaburoYHambre" className="menu-logo-img" />
        <div className="user-welcome">
          <span>Bienvenido, <strong>{user?.username || 'Desarrollador'}</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-header" onClick={() => setShowHistorial(true)}>
            Ver Historial
          </button>
          <button className="btn-header" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="menu-content">
        <div className='div-logo-inicio'>
          <img src={logoLaburoYHambre} alt="LaburoYHambre" className="menu-logo-img-principal" />
        </div>
        {loading ? (
          <div className="menu-spinner">Cargando estado del juego...</div>
        ) : (
          <div className="menu-cards-grid">
            {/* 1. Continuar Carrera */}
            <div className={`menu-card-frame ${!activeRun ? 'disabled' : ''}`}>
              <div className="card-badge"></div>
              <h2 className="h2-inicio">Continuar Carrera</h2>
              {activeRun ? (
                <div className="card-preview">
                  <p><strong>Edad Actual:</strong> {activeRun.edadActual} años</p>
                  <p><strong>Dinero Generado:</strong> ${activeRun.dineroGenerado.toLocaleString()}</p>
                  <p><strong>Trabajo:</strong> {activeRun.trabajoActual?.puesto || 'Desempleado / Freelance'}</p>
                </div>
              ) : (
                <p className="card-empty">No hay ninguna carrera activa guardada actualmente.</p>
              )}
              <button
                className="btn-pal-inicio"
                disabled={!activeRun}
                onClick={handleContinueGame}
              >
                <h3 className='h3-inicio'><strong>Continuar Carrera</strong></h3>
              </button>
            </div>

            {/* 2. Nueva Partida */}
            <div className="menu-card-frame">
              <div className="card-badge"></div>
              <h2 className="h2-inicio">Nueva Partida</h2>
              <p className="card-description">
                Comienza una carrera profesional desde los 18 años. Toma decisiones clave, postúlate a empleos y llega al éxito financiero antes de la jubilación.
              </p>
              <button className="btn-pal-inicio" onClick={handleStartNewGame}>
                <h3 className='h3-inicio'><strong>Iniciar Nueva Carrera</strong></h3>
              </button>
            </div>

            {/* 3. Ranking Global */}
            <div className="menu-card-frame">
              <div className="card-badge"></div>
              <h2 className="h2-inicio">Ranking Global</h2>
              <p className="card-description">
                Consulta los mejores desarrolladores que lograron mayor fortuna al jubilarse a los 65 años.
              </p>
              <button className="btn-pal-inicio" onClick={() => setShowRanking(true)}>
                <h3 className='h3-inicio'><strong>Ver Ranking</strong></h3>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <RankingModal isOpen={showRanking} onClose={() => setShowRanking(false)} />
      <HistorialModal isOpen={showHistorial} onClose={() => setShowHistorial(false)} idUsuario={user?.id?.toString() ?? ''} />
    </div>
  );
};


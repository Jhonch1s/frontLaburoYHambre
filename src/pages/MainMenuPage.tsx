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
        <div className="menu-header-actions">
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
            <article className={`menu-card-frame menu-card-career ${!activeRun ? 'disabled' : ''}`}>
              <div className="menu-note-content">
                <span className="card-badge">01 / TU HISTORIA</span>
                <h2 className="h2-inicio">Continuar<br />carrera</h2>
                {activeRun ? (
                  <div className="card-preview">
                    <p><strong>Edad</strong><span>{activeRun.edadActual} años</span></p>
                    <p><strong>Dinero</strong><span>${activeRun.dineroGenerado.toLocaleString()}</span></p>
                    <p><strong>Trabajo</strong><span>{activeRun.trabajoActual?.puesto || 'Sin empleo'}</span></p>
                  </div>
                ) : (
                  <p className="card-empty">Todavía no hay una carrera guardada.</p>
                )}
                <button className="btn-pal-inicio" disabled={!activeRun} onClick={handleContinueGame}>
                  <span>{activeRun ? 'Seguir jugando' : 'Sin partida'}</span><span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>

            <article className="menu-card-frame menu-card-new">
              <div className="menu-note-content">
                <span className="card-badge">02 / BORRÓN Y CUENTA NUEVA</span>
                <h2 className="h2-inicio">Nueva<br />partida</h2>
                <p className="card-description">
                  Empezá a los 18. Buscá trabajo, tomá decisiones y tratá de llegar a fin de mes.
                </p>
                <button className="btn-pal-inicio" onClick={handleStartNewGame}>
                  <span>Empezar de cero</span><span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>

            <article className="menu-card-frame menu-card-ranking">
              <div className="menu-note-content">
                <span className="card-badge">03 / LOS QUE LLEGARON</span>
                <h2 className="h2-inicio">Ranking<br />global</h2>
                <p className="card-description">
                  Mirá quién llegó a los 65 con la billetera más llena.
                </p>
                <button className="btn-pal-inicio" onClick={() => setShowRanking(true)}>
                  <span>Ver el ranking</span><span aria-hidden="true">↗</span>
                </button>
              </div>
            </article>
          </div>
        )}
      </main>

      <Footer />
      <RankingModal isOpen={showRanking} onClose={() => setShowRanking(false)} />
      <HistorialModal isOpen={showHistorial} onClose={() => setShowHistorial(false)} idUsuario={user?.id?.toString() ?? ''} />
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRunActiva, crearRun } from '../services/api';
import type { RunTrabajo } from '../types';
import { RankingModal } from '../components/RankingModal';

export const MainMenuPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeRun, setActiveRun] = useState<RunTrabajo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showRanking, setShowRanking] = useState<boolean>(false);

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
      await crearRun(user.id, 1);
      navigate('/game');
    } catch (err) {
      console.error('Error al iniciar nueva partida:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGame = () => {
    if (activeRun) {
      navigate('/game');
    }
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <div className="user-welcome">
          <span>Bienvenido, <strong>{user?.username || 'Desarrollador'}</strong></span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>
          Cerrar Sesión 🚪
        </button>
      </header>

      <main className="menu-content">
        <h1 className="menu-title">Menú Principal</h1>
        <p className="menu-subtitle">Gestiona tu trayectoria en el mercado IT</p>

        {loading ? (
          <div className="menu-spinner">Cargando estado del juego...</div>
        ) : (
          <div className="menu-cards-grid">
            {/* 1. Continuar Carrera */}
            <div className={`menu-card ${!activeRun ? 'disabled' : ''}`}>
              <div className="card-badge">💾 PARTIDA GUARDADA</div>
              <h2>Continuar Carrera</h2>
              {activeRun ? (
                <div className="card-preview">
                  <p><strong>Edad Actual:</strong> {activeRun.edadActual} años</p>
                  <p><strong>Dinero Generado:</strong> ${activeRun.dineroGenerado.toLocaleString()}</p>
                  <p><strong>Trabajo:</strong> {activeRun.trabajoActual?.puesto || 'Desempleado/Freelance'}</p>
                </div>
              ) : (
                <p className="card-empty">No hay ninguna carrera activa guardada actualmente.</p>
              )}
              <button
                className="btn btn-primary btn-block"
                disabled={!activeRun}
                onClick={handleContinueGame}
              >
                Continuar ▶
              </button>
            </div>

            {/* 2. Nueva Partida */}
            <div className="menu-card highlight-card">
              <div className="card-badge">🚀 NUEVO COMIENZO</div>
              <h2>Nueva Partida</h2>
              <p className="card-description">
                Comienza una carrera profesional desde los 18 años. Toma decisiones clave, postúlate a empleos y llega al éxito financiero antes de la jubilación.
              </p>
              <button className="btn btn-success btn-block" onClick={handleStartNewGame}>
                Iniciar Nueva Carrera ✨
              </button>
            </div>

            {/* 3. Ranking Global */}
            <div className="menu-card">
              <div className="card-badge">🏆 HALL OF FAME</div>
              <h2>Ranking Global</h2>
              <p className="card-description">
                Consulta los mejores desarrolladores que lograron mayor fortuna al jubilarse a los 65 años.
              </p>
              <button className="btn btn-outline btn-block" onClick={() => setShowRanking(true)}>
                Ver Tabla de Posiciones 📊
              </button>
            </div>
          </div>
        )}
      </main>

      <RankingModal isOpen={showRanking} onClose={() => setShowRanking(false)} />
    </div>
  );
};

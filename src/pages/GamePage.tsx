import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getRunActiva,
  crearRun,
  aumentarAño,
  getHabilidades,
  evaluarEvento,
  tomarDecision,
  getId,
} from '../services/api';
import type { RunTrabajo, Habilidad, Evento, HistorialAño } from '../types';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { EventModal } from '../components/EventModal';
import { RankingModal } from '../components/RankingModal';
import { DeathScreenOverlay } from '../components/DeathScreenOverlay';

export const GamePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [run, setRun] = useState<RunTrabajo | null>(null);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [historial, setHistorial] = useState<HistorialAño[]>([]);
  const [currentEvento, setCurrentEvento] = useState<Evento | null>(null);
  const [showJubilacionModal, setShowJubilacionModal] = useState<boolean>(false);
  const [showDeathOverlay, setShowDeathOverlay] = useState<boolean>(false);
  const [deathCause, setDeathCause] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [advancing, setAdvancing] = useState<boolean>(false);

  // Estado del desplegable (acordeón) de habilidades
  const [skillsExpanded, setSkillsExpanded] = useState<boolean>(true);

  // Estado de paginación del historial (10 por página)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Inicializar o cargar run activa
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    getRunActiva(user.id)
      .then(async (activeRun) => {
        let current = activeRun;
        if (!current || current.estado === 'FINALIZADA' || current.estado === 'Completada' || current.estado === 'MUERTO') {
          current = await crearRun(user.id || '', 1);
        }
        setRun(current);

        const runId = getId(current);
        if (runId) {
          const habs = await getHabilidades(runId);
          setHabilidades([...habs]);
        }

        rebuildHistorial(current);
      })
      .catch((err) => console.error('Error al inicializar la partida:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const rebuildHistorial = (currentRun: RunTrabajo) => {
    if (!currentRun) return;

    let items: HistorialAño[] = [];

    if (currentRun.historialAnual && currentRun.historialAnual.length > 0) {
      items = currentRun.historialAnual.map((h: any) => ({
        edad: h.edad,
        empresaYPuesto: h.puestoEmpresa || 'Pasante Trainee de Informática @ Startup Tech Innovadora',
        salarioAnual: typeof h.salarioAnual === 'number' ? h.salarioAnual : 0,
        dineroAcumulado: typeof h.dineroAcumulado === 'number' ? h.dineroAcumulado : 0,
      }));
    } else {
      const minEdad = 18;
      const targetEdad = Math.min(currentRun.edadActual, 65);
      let accumDinero = 0;
      const baseSalario = currentRun.salarioActual || (currentRun.trabajoActual ? currentRun.trabajoActual.salarioAnual || 10000 : 0);

      for (let age = minEdad; age <= targetEdad; age++) {
        if (age === currentRun.edadActual) {
          accumDinero = currentRun.dineroGenerado;
        } else {
          accumDinero += Math.round(baseSalario);
        }

        let puestoEmpresa = currentRun.trabajoActual
          ? `${currentRun.trabajoActual.puesto} @ ${currentRun.trabajoActual.empresa}`
          : '🚨 DESPEDIDO / En búsqueda laboral';

        items.push({
          edad: age,
          empresaYPuesto: puestoEmpresa,
          salarioAnual: currentRun.trabajoActual ? baseSalario : 0,
          dineroAcumulado: accumDinero,
        });
      }
    }

    setHistorial(items);

    // Paginación automática: Salto automático a la última página si supera los 10 registros
    const newTotalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    setCurrentPage(newTotalPages);
  };

  const handleAvanzarAño = async () => {
    if (!user?.id || !run || advancing) return;
    if (run.edadActual >= 65 || run.estado === 'Completada' || run.estado === 'MUERTO') {
      setShowJubilacionModal(true);
      return;
    }

    setAdvancing(true);

    try {
      const runId = getId(run);
      const updatedRun = await aumentarAño(user.id, runId);
      setRun(updatedRun);

      const updatedRunId = getId(updatedRun);
      const updatedHabs = await getHabilidades(updatedRunId);
      setHabilidades([...updatedHabs]);

      rebuildHistorial(updatedRun);

      // Verificar fin de carrera por jubilación o estado completado
      if (updatedRun.edadActual >= 65 || updatedRun.estado === 'Completada') {
        setShowJubilacionModal(true);
        setAdvancing(false);
        return;
      }

      // Evaluar eventos
      const evento = await evaluarEvento(updatedRunId, updatedRun);
      if (evento) {
        setCurrentEvento(evento);
      }
    } catch (err) {
      console.error('Error al avanzar el año:', err);
    } finally {
      setAdvancing(false);
    }
  };

  const handleTomarDecision = async (opcionId: string) => {
    if (!run || !currentEvento) return;
    const runId = getId(run);
    const eventoId = getId(currentEvento);

    try {
      const isMuerteEvent = currentEvento.tipo === 'MUERTE';
      const eventDesc = currentEvento.descripcion;

      const result = await tomarDecision(runId, eventoId, opcionId);
      if (result.runActualizada) {
        setRun(result.runActualizada);
        rebuildHistorial(result.runActualizada);

        if (isMuerteEvent || result.runActualizada.estado === 'MUERTO') {
          setDeathCause(eventDesc || 'Sobredosis de energizantes en el deploy o impacto de rayo en el teclado.');
          setShowDeathOverlay(true);
        } else if (result.runActualizada.estado === 'Completada' || result.runActualizada.edadActual >= 65) {
          setShowJubilacionModal(true);
        }
      }

      const updatedHabs = await getHabilidades(runId);
      setHabilidades([...updatedHabs]);
    } catch (err) {
      console.error('Error al tomar decisión:', err);
    } finally {
      setCurrentEvento(null);
    }
  };

  if (loading || !run) {
    return (
      <div className="game-loading-screen">
        <div className="game-spinner">Cargando simulador de carrera...</div>
      </div>
    );
  }

  // Paginación del historial
  const totalPages = Math.max(1, Math.ceil(historial.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHistorialPage = historial.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="game-container">
      {/* HUD SUPERIOR */}
      <header className="game-hud">
        <div className="hud-brand">
          <button className="btn btn-icon" onClick={() => navigate('/menu')}>
            ⬅ Menú
          </button>
          <h2>LaburoYHambre</h2>
        </div>

        <div className="hud-metrics">
          <div className="hud-pill">
            <span className="hud-label">Usuario</span>
            <span className="hud-value">{user?.username || 'Estudiante Tecnólogo'}</span>
          </div>

          <div className="hud-pill highlight-pill">
            <span className="hud-label">Dinero Acumulado</span>
            <span className="hud-value">${run.dineroGenerado.toLocaleString()}</span>
          </div>

          <div className="hud-pill">
            <span className="hud-label">Edad / Año</span>
            <span className="hud-value">{run.edadActual} años ({run.añoActual || run.anioActual || 2027})</span>
          </div>

          <div className="hud-pill">
            <span className="hud-label">Trabajo Actual</span>
            <span className="hud-value">{run.trabajoActual ? run.trabajoActual.puesto : '🚨 DESPEDIDO / Sin empleo'}</span>
          </div>
        </div>
      </header>

      {/* LAYOUT DE 2 COLUMNAS */}
      <div className="game-body-layout">
        {/* COLUMNA IZQUIERDA: PANEL DE CONTROL */}
        <aside className="game-left-column">
          {/* Avatar Dinámico */}
          <PlayerAvatar edadActual={run.edadActual} dineroGenerado={run.dineroGenerado} />

          {/* Tarjeta Trabajo Actual */}
          <div className="card job-card">
            <h3>🏢 Estado Laboral & Empresa</h3>
            {run.trabajoActual ? (
              <div className="job-details">
                <p className="job-title">{run.trabajoActual.puesto}</p>
                <p className="job-company">{run.trabajoActual.empresa} {run.trabajoActual.tier ? `• Tier ${run.trabajoActual.tier}` : ''}</p>
                <div className="job-salary-badge">
                  Salario Anual: <strong>${(run.salarioActual || run.trabajoActual.salarioAnual || 0).toLocaleString()}</strong> / año
                </div>
              </div>
            ) : (
              <div className="unemployed-badge">
                <p className="job-title text-danger">🚨 DESPEDIDO / En Búsqueda Laboral</p>
                <p className="job-company">Sin empleo activo</p>
                <div className="job-salary-badge salary-zero">
                  Ingresos Anuales: <strong>$0 / año</strong>
                </div>
              </div>
            )}
          </div>

          {/* Lista Habilidades en Acordeón Desplegable */}
          <div className="card skills-card">
            <div
              className="skills-accordion-header"
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 style={{ margin: 0 }}>⚡ Habilidades ({habilidades.length})</h3>
              <span className="accordion-arrow-icon" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {skillsExpanded ? '▲' : '▼'}
              </span>
            </div>

            {skillsExpanded && (
              <div className="skills-list" style={{ marginTop: '1rem' }}>
                {habilidades.map((hab) => (
                  <div key={hab.id || hab._id} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{hab.nombre}</span>
                      <span className="skill-level">{hab.nivel || 0} / 10</span>
                    </div>
                    <div className="skill-bar-track">
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${Math.min(100, Math.max(0, ((hab.nivel || 0) / 10) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón Principal Avanzar Año */}
          <button
            className="btn btn-primary btn-advance-year btn-block"
            onClick={handleAvanzarAño}
            disabled={advancing || run.edadActual >= 65 || run.estado === 'Completada' || run.estado === 'MUERTO'}
          >
            {advancing
              ? 'Avanzando...'
              : run.edadActual >= 65 || run.estado === 'Completada' || run.estado === 'MUERTO'
              ? '🏁 Partida Finalizada'
              : '📅 Avanzar Año (+1 Año)'}
          </button>
        </aside>

        {/* COLUMNA DERECHA: HISTORIAL CON PAGINACIÓN DE 10 EN 10 */}
        <main className="game-right-column">
          <div className="card history-card">
            <div className="history-header">
              <h3>📜 Historial Profesional por Edad (18 a 65 Años)</h3>
              <span className="history-count">{historial.length} Registros Anuales</span>
            </div>

            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Edad</th>
                    <th>Empresa y Puesto</th>
                    <th>Salario Anual</th>
                    <th>Dinero Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistorialPage.map((row) => (
                    <tr key={row.edad} className={row.edad === run.edadActual ? 'current-age-row' : ''}>
                      <td className="age-cell">{row.edad} {row.edad === run.edadActual ? '📍' : ''}</td>
                      <td className="role-cell">{row.empresaYPuesto}</td>
                      <td className="salary-cell">${row.salarioAnual.toLocaleString()}</td>
                      <td className="accumulated-cell">${row.dineroAcumulado.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BARRA DE PAGINACIÓN */}
            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ◀ Anterior
              </button>

              <span className="pagination-info" style={{ fontWeight: 'bold' }}>
                Página {currentPage} de {totalPages} ({historial.length} años)
              </span>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* EVENT MODAL */}
      <EventModal evento={currentEvento} onSelectOption={handleTomarDecision} />

      {/* DARK SOULS DEATH OVERLAY */}
      <DeathScreenOverlay
        isOpen={showDeathOverlay}
        causeOfDeath={deathCause}
        onContinue={() => {
          setShowDeathOverlay(false);
          setShowJubilacionModal(true);
        }}
      />

      {/* RANKING / RESUMEN FINAL MODAL */}
      <RankingModal
        isOpen={showJubilacionModal}
        isJubilacion={true}
        finalRun={run}
        finalHabilidades={habilidades}
        onClose={() => {
          setShowJubilacionModal(false);
          navigate('/menu');
        }}
      />
    </div>
  );
};

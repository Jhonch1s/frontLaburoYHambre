import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getRunActiva,
  crearRun,
  aumentarAño,
  getHabilidades,
  evaluarEvento,
  tomarDecision,
  getId,
  getDetalleRun,
} from '../services/api';
import type { RunTrabajo, Habilidad, Evento, HistorialAño } from '../types';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { EventModal } from '../components/EventModal';
import { RankingModal } from '../components/RankingModal';
import { DeathScreenOverlay } from '../components/DeathScreenOverlay';
import {
  logoLaburoYHambre,
  botonSiguienteAno,
  flechaIcon,
  backendSticker,
  frontendSticker,
  inglesSticker,
  cloudInfraSticker,
  liderazgoSticker,
  googleSticker,
  mercadoLibreSticker,
  globantSticker,
  startupSticker,
  despidoSticker,
} from '../assets';

export const GamePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Helper sticker para cada habilidad
  const getSkillSticker = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('back')) return backendSticker;
    if (lower.includes('front')) return frontendSticker;
    if (lower.includes('ingl') || lower.includes('english')) return inglesSticker;
    if (lower.includes('cloud') || lower.includes('infra') || lower.includes('devops')) return cloudInfraSticker;
    if (lower.includes('lid') || lower.includes('gest') || lower.includes('lead')) return liderazgoSticker;
    return backendSticker;
  };

  // Helper sticker para empresas
  const getCompanySticker = (empresaName?: string) => {
    if (!empresaName) return despidoSticker;
    const lower = empresaName.toLowerCase();
    if (lower.includes('google')) return googleSticker;
    if (lower.includes('mercado') || lower.includes('libre')) return mercadoLibreSticker;
    if (lower.includes('globant')) return globantSticker;
    return startupSticker;
  };

  // Inicializar o cargar la partida correspondiente (desde state o del backend)
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    const targetRun = location.state?.targetRun as RunTrabajo | undefined;
    const isNew = location.state?.isNew as boolean | undefined;

    if (targetRun && getId(targetRun) && !isNew) {
      setRun(targetRun);
      const runId = getId(targetRun);
      getHabilidades(runId).then((habs) => setHabilidades([...habs]));
      rebuildHistorial(targetRun);
      if (targetRun.edadActual >= 65 || targetRun.estado === 'Completada' || targetRun.estado === 'FINALIZADA') {
        setShowJubilacionModal(true);
      }
      setLoading(false);
    } else {
      getRunActiva(user.id)
        .then(async (activeRun) => {
          let current = activeRun;
          if (!current || current.estado === 'FINALIZADA' || current.estado === 'Completada' || current.estado === 'MUERTO') {
            const allRuns = await getDetalleRun(user.id || '');
            const lastRun = allRuns[0];
            if (lastRun && (lastRun.edadActual >= 65 || lastRun.estado === 'Completada' || lastRun.estado === 'FINALIZADA') && !isNew) {
              setRun(lastRun);
              const runId = getId(lastRun);
              if (runId) {
                const habs = await getHabilidades(runId);
                setHabilidades([...habs]);
              }
              rebuildHistorial(lastRun);
              setShowJubilacionModal(true);
              setLoading(false);
              return;
            }

            current = await crearRun(user.id || '', 1);
          }
          setRun(current);

          const runId = getId(current);
          if (runId) {
            const habs = await getHabilidades(runId);
            setHabilidades([...habs]);
          }

          rebuildHistorial(current);
          if (current && (current.edadActual >= 65 || current.estado === 'Completada' || current.estado === 'FINALIZADA')) {
            setShowJubilacionModal(true);
          }
        })
        .catch((err) => console.error('Error al inicializar la partida:', err))
        .finally(() => setLoading(false));
    }
  }, [user, location.state]);

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
      const targetEdad = Math.min(currentRun.edadActual || 18, 65);
      let accumDinero = 0;
      const baseSalario = currentRun.salarioActual || (currentRun.trabajoActual ? currentRun.trabajoActual.salarioAnual || 10000 : 0);

      for (let age = minEdad; age <= targetEdad; age++) {
        if (age === (currentRun.edadActual || 18)) {
          accumDinero = currentRun.dineroGenerado || 0;
        } else {
          accumDinero += Math.round(baseSalario);
        }

        let puestoEmpresa = currentRun.trabajoActual
          ? `${currentRun.trabajoActual.puesto} @ ${currentRun.trabajoActual.empresa}`
          : 'DESPEDIDO / En búsqueda laboral';

        items.push({
          edad: age,
          empresaYPuesto: puestoEmpresa,
          salarioAnual: currentRun.trabajoActual ? baseSalario : 0,
          dineroAcumulado: accumDinero,
        });
      }
    }

    setHistorial(items);

    // Paginación automática: Salto a la última página si supera los 10 registros
    const newTotalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    setCurrentPage(newTotalPages);
  };

  const handleAvanzarAño = async () => {
    if (!user?.id || !run || advancing) return;

    const currentAge = Number(run.edadActual || 18);
    const isAlreadyFinished =
      currentAge >= 65 ||
      run.estado?.toLowerCase() === 'completada' ||
      run.estado?.toLowerCase() === 'finalizada' ||
      run.estado === 'MUERTO';

    if (isAlreadyFinished) {
      setShowJubilacionModal(true);
      return;
    }

    setAdvancing(true);

    try {
      const runId = getId(run);
      const updatedRun = await aumentarAño(user.id, runId);
      const newAge = Math.max(currentAge + 1, Number(updatedRun.edadActual || currentAge + 1));
      const isRetirement =
        newAge >= 65 ||
        updatedRun.estado?.toLowerCase() === 'completada' ||
        updatedRun.estado?.toLowerCase() === 'finalizada';

      if (isRetirement) {
        const completedRun: RunTrabajo = {
          ...updatedRun,
          edadActual: 65,
          estado: 'Completada',
        };
        setRun(completedRun);
        rebuildHistorial(completedRun);
        setCurrentEvento(null);
        setShowJubilacionModal(true);
        setAdvancing(false);
        return;
      }

      setRun(updatedRun);
      const updatedRunId = getId(updatedRun);
      const updatedHabs = await getHabilidades(updatedRunId);
      setHabilidades([...updatedHabs]);
      rebuildHistorial(updatedRun);

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
        } else if (
          result.runActualizada.estado?.toLowerCase() === 'completada' ||
          result.runActualizada.estado?.toLowerCase() === 'finalizada' ||
          Number(result.runActualizada.edadActual || 0) >= 65
        ) {
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
  const currentCompanySticker = getCompanySticker(run.trabajoActual?.empresa);
  const isFinishedRun =
    Number(run.edadActual || 18) >= 65 ||
    run.estado?.toLowerCase() === 'completada' ||
    run.estado?.toLowerCase() === 'finalizada' ||
    run.estado === 'MUERTO';

  return (
    <div className="game-container">
      {/* HUD SUPERIOR CON MARCO HORIZONTAL */}
      <header className="game-hud">
        <div className="hud-brand">
          <button className="btn-menu-hud" onClick={() => navigate('/menu')}>
            Menú
          </button>
          <img src={logoLaburoYHambre} alt="LaburoYHambre" className="hud-logo-img" />
        </div>

        <div className="hud-metrics-frame">
          <div className="hud-pill">
            <span className="hud-label">Usuario</span>
            <span className="hud-value">{user?.username || 'Estudiante Tecnólogo'}</span>
          </div>

          <div className="hud-pill">
            <span className="hud-label">Dinero Acumulado</span>
            <span className="hud-value" style={{ color: '#10b981' }}>${(run.dineroGenerado || 0).toLocaleString()}</span>
          </div>

          <div className="hud-pill">
            <span className="hud-label">Edad / Año</span>
            <span className="hud-value">{run.edadActual || 18} años ({run.añoActual || run.anioActual || 2027})</span>
          </div>

          <div className="hud-pill">
            <span className="hud-label">Trabajo Actual</span>
            <span className="hud-value">{run.trabajoActual ? run.trabajoActual.puesto : 'DESPEDIDO / Sin empleo'}</span>
          </div>
        </div>
      </header>

      {/* LAYOUT DE 2 COLUMNAS */}
      <div className="game-body-layout">
        {/* COLUMNA IZQUIERDA: PANEL DE CONTROL */}
        <aside className="game-left-column">
          {/* Avatar Dinámico */}
          <PlayerAvatar edadActual={run.edadActual || 18} dineroGenerado={run.dineroGenerado || 0} />

          {/* Tarjeta Trabajo Actual con Marco Simple y Sticker de Empresa */}
          <div className="job-card-frame">
            <div className="job-card-header">
              <h3>Estado Laboral y Empresa</h3>
              <img src={currentCompanySticker} alt="Empresa Sticker" className="company-sticker-img" />
            </div>
            {run.trabajoActual ? (
              <div className="job-details">
                <p className="job-title">{run.trabajoActual.puesto}</p>
                <p className="job-company">{run.trabajoActual.tier ? `• Tier ${run.trabajoActual.tier}` : ''}</p>
                <div className="job-salary-badge">
                  Salario Anual: <strong>${(run.salarioActual || run.trabajoActual.salarioAnual || 0).toLocaleString()}</strong> / año
                </div>
              </div>
            ) : (
              <div className="unemployed-badge">
                <p className="job-title text-danger">Sin trabajo</p>
                <p className="job-company">Sin empleo activo</p>
                <div className="job-salary-badge salary-zero">
                  Ingresos Anuales: <strong>$0 / año</strong>
                </div>
              </div>
            )}
          </div>

          {/* Lista Habilidades en Acordeón Desplegable con Marco de Habilidades y Sticker Flecha */}
          <div className="skills-card-frame">
            <div
              className="skills-accordion-header"
              onClick={() => setSkillsExpanded(!skillsExpanded)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <h3 className="skills-title" style={{ margin: 0 }}>Habilidades ({habilidades.length})</h3>
              <span className="accordion-arrow-icon">
                <img
                  src={flechaIcon}
                  alt="Toggle Habilidades"
                  className={`accordion-arrow-img ${skillsExpanded ? 'expanded' : ''}`}
                />
              </span>
            </div>

            {skillsExpanded && (
              <div className="skills-list">
                {habilidades.map((hab) => {
                  const sticker = getSkillSticker(hab.nombre);
                  return (
                    <div key={hab.id || hab._id} className="skill-item">
                      <div className="skill-info">
                        <div className="skill-left-group">
                          <img src={sticker} alt={hab.nombre} className="skill-sticker-icon" />
                          <span className="skill-name">{hab.nombre}</span>
                        </div>
                        <span className="skill-level">{hab.nivel || 0} / 10</span>
                      </div>
                      <div className="skill-bar-track">
                        <div
                          className="skill-bar-fill"
                          style={{ width: `${Math.min(100, Math.max(0, ((hab.nivel || 0) / 10) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón Principal Avanzar Año Usando Boton Siguiente Año Frame Overlay */}
          <div className="btn-advance-year-container">
            <img
              src={botonSiguienteAno}
              alt="Boton Avanzar Año"
              className={`btn-advance-year-img ${advancing ? 'disabled' : ''}`}
              onClick={handleAvanzarAño}
            />
            <div className="btn-advance-text-overlay" onClick={handleAvanzarAño}>
              {advancing
                ? 'AVANZANDO AÑO...'
                : isFinishedRun
                ? 'VER RANKING JUBILACIÓN'
                : 'AVANZA AÑO'}
            </div>
          </div>
        </aside>

        {/* COLUMNA DERECHA: HISTORIAL CON PAGINACIÓN DE 10 EN 10 Y TEXTURA LIBRETA */}
        <main className="game-right-column">
          <div className="history-card-frame">
            <div className="history-header">
              <h3>Historial Profesional</h3>
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
                      <td className="age-cell">{row.edad}</td>
                      <td className="role-cell">{row.empresaYPuesto}</td>
                      <td className="salary-cell">${row.salarioAnual.toLocaleString()}</td>
                      <td className="accumulated-cell">${row.dineroAcumulado.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BARRA DE PAGINACIÓN */}
            <div className="pagination-bar">
              <button
                className="btn-pagination-azul"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <span className="pagination-info">
                Página {currentPage} de {totalPages} ({historial.length} años)
              </span>

              <button
                className="btn-pagination-azul"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
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


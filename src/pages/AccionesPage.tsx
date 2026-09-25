import React, { useEffect, useState , useMemo} from 'react';
import { CrecimientoChart } from '../components/CrecimientoChart';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDetallePartida, getHabilidades, } from '../services/api';
import type { RunTrabajo, Habilidad } from '../types';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Footer } from '../components/Footer';
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

export const AccionesPage: React.FC = () => {

    const getCompanySticker = (empresaName?: string, puestoName?: string) => {
        const text = `${empresaName || ''} ${puestoName || ''}`.toLowerCase();
        if (!text.trim() || text.includes('despedido') || text.includes('desempleado') || text.includes('búsqueda') || text.includes('sin empleo') || text.includes('sin trabajo')) return despidoSticker;
        if (text.includes('google')) return googleSticker;
        if (text.includes('mercado') || text.includes('libre') || text.includes('meli')) return mercadoLibreSticker;
        if (text.includes('globant')) return globantSticker;
        return startupSticker;
    };
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [oldRun, setOldRun] = useState<RunTrabajo | null>(null);
    const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showRanking, setShowRanking] = useState<boolean>(false);
    const [showHistorial, setShowHistorial] = useState<boolean>(false);

    useEffect(() => {
        if (!id || !user?.id) return;

        setLoading(true);
        getDetallePartida(id)
            .then(setOldRun)
            .catch(err => console.error('Error cargando detalle:', err))
            .finally(() => setLoading(false));

        getHabilidades(id)
            .then((habs) => setHabilidades([...habs]))
            .catch(err => console.error(err));
    }, [id, user?.id]);

    const getSkillSticker = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('back')) return backendSticker;
        if (lower.includes('front')) return frontendSticker;
        if (lower.includes('ingl') || lower.includes('english')) return inglesSticker;
        if (lower.includes('cloud') || lower.includes('infra') || lower.includes('devops')) return cloudInfraSticker;
        if (lower.includes('lid') || lower.includes('gest') || lower.includes('lead')) return liderazgoSticker;
        return backendSticker;
    };

    const chartData = {
        labels: oldRun?.historialAnual?.map((h) => (h.anio ?? 0).toString()) ?? [],
        values: oldRun?.historialAnual?.map((h) => h.dineroAcumulado) ?? [],
    };

    console.log(chartData)

    const currentCompanySticker = getCompanySticker(oldRun?.trabajoActual?.empresa, oldRun?.trabajoActual?.puesto);
    console.log(oldRun?.muerto)


    return (
        <div className="menu-container">
            <header className="menu-header">
                <img src={logoLaburoYHambre} alt="LaburoYHambre" className="menu-logo-img" />
                <div className="user-welcome">
                    <span>Bienvenido, <strong>{user?.username || 'Desarrollador'}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-header" onClick={() => navigate('/menu')}>
                        Regresar a menu
                    </button>
                    <button className="btn-header" onClick={logout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
                <h1>Resumen de la partida</h1>
            </div>
            <div className="game-body-layout">
                <aside className='game-left-column'>
                    <div className='retrato-jugador' style={{ marginTop: 15 }}>
                        <PlayerAvatar edadActual={Number(oldRun?.edadActual)} dineroGenerado={Number(oldRun?.dineroGenerado)} estaMuerto={Number(oldRun?.edadActual) < 65} />
                    </div>

                    <div className="job-card-frame">
                        <div className="job-card-header">
                            <h3>Estado Laboral y Empresa</h3>
                            <img src={currentCompanySticker} alt="Empresa Sticker" className="company-sticker-img" />
                        </div>
                        {oldRun?.trabajoActual ? (
                            <div className="job-details">
                                <p className="job-title">{oldRun.trabajoActual.puesto}</p>
                                <p className="job-company">{oldRun.trabajoActual.tier ? `• Tier ${oldRun.trabajoActual.tier}` : ''}</p>
                                <div className="job-salary-badge">
                                    Salario Anual: <strong>{oldRun.edadActual < 65 ? "esta muerto lol" : "xddd"}</strong> / año
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

                    <div className="skills-card-frame">
                        <div
                            className="skills-accordion-header"

                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <h3 className="skills-title" style={{ margin: 0 }}>Habilidades ({habilidades.length})</h3>
                            <span className="accordion-arrow-icon">

                            </span>
                        </div>

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

                    </div>
                </aside>
                <main className='game-right-column'>
                    <div className="history-card-frame">
                        <div className="history-header">
                            <h3>Historial Profesional</h3>
                            <span className="history-count">Registros Anuales</span>
                            
                        </div>
                        <div>
                            <CrecimientoChart chartData={chartData}></CrecimientoChart>
                        </div>
                    </div>
                </main>

            </div>



            <Footer />
        </div>
    );
};


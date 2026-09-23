import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRunActiva, crearRun } from '../services/api';
import type { RunTrabajo } from '../types';
import { PlayerAvatar } from '../components/PlayerAvatar';
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
                    <button className="btn-header" onClick={() => navigate('/menu')}>
                        Regresar a menu
                    </button>
                    <button className="btn-header" onClick={logout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div style={{textAlign: 'center', marginTop: 10}}>
                <h1>Resumen de la partida</h1>
            </div>
            <div className="game-body-layout">
                <aside className='game-left-column'>
                    <div className='retrato-jugador' style={{marginTop: 15}}>
                        <PlayerAvatar edadActual={18} dineroGenerado={3131321} />
                    </div>
                </aside>
                <main className='game-right-column'>
                    <div className="history-card-frame">
                        <div className="history-header">
                            <h3>Historial Profesional</h3>
                            <span className="history-count">Registros Anuales</span>
                        </div>

                        



                    </div>
                </main>

            </div>



            <Footer />
        </div>
    );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoLaburoYHambre } from '../assets';
import { Footer } from '../components/Footer';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        if (!email) {
          setErrorMsg('Por favor ingrese su email');
          setLoading(false);
          return;
        }
        await login({ email, password });
      } else {
        if (!username || !email) {
          setErrorMsg('Por favor complete todos los campos');
          setLoading(false);
          return;
        }
        await register({ username, email, password });
      }
      navigate('/menu');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <img src={logoLaburoYHambre} alt="LaburoYHambre" className="auth-logo-img" />
            <p className="brand-subtitle"><strong>Simulador de Carrera y Supervivencia</strong></p>
          </div>

          <div className="auth-tabs">
            <button
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

            {activeTab === 'register' && (
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  id="username"
                  type="text"
                  placeholder="ej: DevNinja"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading
                ? 'Cargando...'
                : activeTab === 'login'
                ? 'Ingresar al Juego'
                : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

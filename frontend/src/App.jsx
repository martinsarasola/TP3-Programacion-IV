import { useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from './services/api.js';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ResourcePage from './pages/ResourcePage.jsx';
import TripsPage from './pages/TripsPage.jsx';

export default function App() {
  const [page, setPage] = useState('inicio');
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const expired = () => { setUser(null); setPage('login'); setNotice('La sesión terminó. Iniciá sesión nuevamente.'); };
    window.addEventListener('session-expired', expired);
    if (getToken()) api('/auth/me').then(data => setUser(data.user)).catch(() => {}).finally(() => setChecking(false));
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  function login(data) { setToken(data.token); setUser(data.user); setNotice(''); setPage('vehiculos'); }
  function logout() { clearToken(); setUser(null); setPage('inicio'); setNotice('Sesión cerrada.'); }
  function navigate(next) { setNotice(''); setPage(next); }
  return <>
    <header className="topbar"><div className="topbar-inner"><button className="brand" onClick={() => navigate('inicio')}><span className="brand-icon">T</span><span>Transporte<span className="brand-sub">GESTIÓN DE FLOTA</span></span></button><nav aria-label="Navegación principal">
      <button className={page === 'inicio' ? 'active' : ''} onClick={() => navigate('inicio')}>Inicio</button>
      {user ? <><button className={page === 'vehiculos' ? 'active' : ''} onClick={() => navigate('vehiculos')}>Vehículos</button><button className={page === 'conductores' ? 'active' : ''} onClick={() => navigate('conductores')}>Conductores</button><button className={page === 'viajes' ? 'active' : ''} onClick={() => navigate('viajes')}>Viajes</button><button className="nav-exit" onClick={logout}>Cerrar sesión</button></> : <><button className={page === 'login' ? 'active' : ''} onClick={() => navigate('login')}>Ingresar</button><button className="nav-register" onClick={() => navigate('registro')}>Crear cuenta</button></>}
    </nav></div></header>
    <main className="container">{notice && <p className="notice" role="status">{notice}</p>}{checking ? <p>Cargando sesión…</p> : <>
      {page === 'inicio' && <HomePage navigate={navigate} user={user} />}
      {!user && (page === 'login' || page === 'registro') && <AuthPage key={page} mode={page} navigate={navigate} onLogin={login} />}
      {user && page === 'vehiculos' && <ResourcePage key="vehiculos" type="vehiculos" />}
      {user && page === 'conductores' && <ResourcePage key="conductores" type="conductores" />}
      {user && page === 'viajes' && <TripsPage />}
    </>}</main><footer>Programación IV · Sistema de gestión de transporte</footer>
  </>;
}

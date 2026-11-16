import {useEffect,useState} from 'react';
import {api,clearToken,getToken,setToken} from './services/api.js';
import AppShell from './components/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ResourcePage from './pages/ResourcePage.jsx';
import TripsPage from './pages/TripsPage.jsx';

export default function App(){
 const [page,setPage]=useState('inicio'),[intent,setIntent]=useState(''),[user,setUser]=useState(null),[checking,setChecking]=useState(Boolean(getToken())),[notice,setNotice]=useState('');
 useEffect(()=>{const expired=()=>{setUser(null);setPage('login');setNotice('La sesión terminó. Iniciá sesión nuevamente.')};window.addEventListener('session-expired',expired);if(getToken())api('/auth/me').then(data=>{setUser(data.user);setPage('panel')}).catch(()=>{}).finally(()=>setChecking(false));return()=>window.removeEventListener('session-expired',expired)},[]);
 function navigate(next,action=''){setNotice('');setIntent(action);setPage(next)}
 function login(data){setToken(data.token);setUser(data.user);setNotice('');setPage('panel')}
 function logout(){clearToken();setUser(null);setPage('inicio');setNotice('Sesión cerrada.')}
 if(checking)return <div className="session-loading">Cargando sesión…</div>;
 if(!user)return <div className="public-app">{notice&&<div className="public-notice" role="status">{notice}</div>}{page==='login'||page==='registro'?<AuthPage key={page} mode={page} navigate={navigate} onLogin={login}/>:<HomePage navigate={navigate}/>}</div>;
 return <AppShell user={user} page={page} navigate={navigate} onLogout={logout}>{page==='panel'&&<Dashboard navigate={navigate}/ >}{page==='vehiculos'&&<ResourcePage key="vehiculos" type="vehiculos" initialAction={intent}/ >}{page==='conductores'&&<ResourcePage key="conductores" type="conductores" initialAction={intent}/ >}{page==='viajes'&&<TripsPage initialAction={intent}/ >}</AppShell>;
}

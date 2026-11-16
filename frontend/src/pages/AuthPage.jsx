import { useState } from 'react';
import { api } from '../services/api.js';
export default function AuthPage({ mode, navigate, onLogin }) {
  const register = mode === 'registro';
  const [data, setData] = useState({ nombre:'', email:'', password:'' });
  const [error, setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setError('');
    if (register && (!data.nombre.trim() || data.nombre.trim().length > 100)) return setError('Ingresá un nombre de hasta 100 caracteres.');
    if (data.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return setError('Ingresá un correo electrónico válido.');
    const bytes = new TextEncoder().encode(data.password).length;
    if (bytes < 8 || bytes > 72) return setError('La contraseña debe tener entre 8 y 72 bytes.');
    setBusy(true); try {
      if (register) { await api('/auth/register', { method:'POST',data,protectedRoute:false }); navigate('login'); return; }
      const result = await api('/auth/login',{ method:'POST',data:{email:data.email,password:data.password},protectedRoute:false }); onLogin(result);
    } catch (err) { setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.status === 409 ? 'No se pudo crear la cuenta. Revisá el correo ingresado.' : err.status === 400 && err.details?.length ? err.details.map(item => item.message).join('. ') : err.message); } finally { setBusy(false); }
  }
  const input = (name,label,type='text') => <label>{label}<input name={name} type={type} value={data[name]} onChange={e=>setData({...data,[name]:e.target.value})} autoComplete={name === 'password' ? (register ? 'new-password' : 'current-password') : name} /></label>;
  return <section className="auth-wrap"><div className="auth-intro"><span className="eyebrow">TU ESPACIO DE TRABAJO</span><h1>{register ? 'Empezá a organizar tu flota.' : 'Bienvenido de nuevo.'}</h1><p>Una herramienta para mantener tu operación en movimiento.</p></div><form className="card auth-card" onSubmit={submit} noValidate><h2>{register ? 'Crear cuenta' : 'Iniciar sesión'}</h2><p className="muted">{register ? 'Completá tus datos para comenzar.' : 'Ingresá tus datos para continuar.'}</p>{error && <p className="error" role="alert">{error}</p>}{register && input('nombre','Nombre')}{input('email','Correo electrónico','email')}{input('password','Contraseña','password')}<button className="primary full" disabled={busy}>{busy ? 'Procesando…' : register ? 'Crear cuenta' : 'Ingresar'}</button><p className="muted auth-switch">{register ? '¿Ya tenés cuenta?' : '¿Todavía no tenés cuenta?'} <button type="button" className="link" onClick={()=>navigate(register ? 'login' : 'registro')}>{register ? 'Iniciá sesión' : 'Registrate'}</button></p></form></section>;
}

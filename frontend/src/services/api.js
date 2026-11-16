const KEY = 'tp3_token';
export const getToken = () => sessionStorage.getItem(KEY);
export const setToken = token => sessionStorage.setItem(KEY, token);
export const clearToken = () => sessionStorage.removeItem(KEY);

export async function api(path, { method = 'GET', data, protectedRoute = true } = {}) {
  let response;
  try {
    response = await fetch('/api' + path, { method, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(protectedRoute && getToken() ? { Authorization: 'Bearer ' + getToken() } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
  } catch { throw new Error('No se pudo conectar con el servidor.'); }
  if (response.status === 401 && protectedRoute) { clearToken(); window.dispatchEvent(new Event('session-expired')); throw new Error('La sesión terminó. Iniciá sesión nuevamente.'); }
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { const message = typeof result.error === 'string' && result.error.trim() ? result.error : `El servidor respondió con HTTP ${response.status}. Verificá la conexión con la API.`; const error = new Error(message); error.status = response.status; error.details = Array.isArray(result.details) ? result.details : []; throw error; }
  return result;
}

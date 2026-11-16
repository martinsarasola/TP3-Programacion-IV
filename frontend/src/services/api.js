export async function getHealth(signal) {
  const response = await fetch('/api/health', { signal });
  if (!response.ok) throw new Error('No se pudo consultar el servidor');
  const data = await response.json();
  if (data.status !== 'ok') throw new Error('Respuesta inesperada del servidor');
  return data;
}

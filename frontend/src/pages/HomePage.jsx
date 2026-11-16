import { useEffect, useState } from 'react';
import { getHealth } from '../services/api.js';

export default function HomePage() {
  const [status, setStatus] = useState('Comprobando conexión con el servidor…');

  useEffect(() => {
    const controller = new AbortController();
    getHealth(controller.signal)
      .then(() => setStatus('Servidor disponible'))
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('Servidor no disponible');
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Sistema de Gestión de Transporte</h1>
      <p>Vehículos, conductores y viajes en un solo lugar.</p>
      <p role="status">{status}</p>
    </main>
  );
}

# TP3 - Programación IV

Sistema de gestión de transporte: frontend React y backend Express.

## Requisitos

Node.js y npm. Para desarrollo local, usar terminales separadas:

```sh
cd backend
npm install
npm run dev
```

```sh
cd frontend
npm install
npm run dev
```

El frontend está disponible en http://localhost:5173 y utiliza el proxy de Vite para consultar `/api/health` en el backend, que escucha por defecto en el puerto 3000. Para configurar el backend, se puede copiar `backend/.env.example` a `backend/.env`. Si se cambia el puerto del backend, también debe actualizarse el destino del proxy en `frontend/vite.config.js`.

Para iniciar el backend sin modo de observación, ejecutar `npm start` en `backend`. Para compilar el frontend, ejecutar `npm run build` en `frontend`.

## Base de datos

Crear una base MySQL dedicada y completar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en `backend/.env` con una cuenta autorizada. Ejecutar `backend/sql/schema.sql` sobre esa base; por ejemplo, desde la raíz del proyecto en PowerShell:

```powershell
Get-Content -Raw backend/sql/schema.sql | mysql --host=127.0.0.1 --user=USUARIO --password NOMBRE_BASE
```

El cliente solicitará la contraseña. Ajustar el ejecutable y el puerto según la instalación. El esquema usa `CREATE TABLE IF NOT EXISTS`: repetirlo conserva los datos, pero no migra ni valida tablas que ya existan. Las restricciones únicas de email, patente, documento y licencia son decisiones de diseño. Consultar `GET /api/health/db` para comprobar la conexión configurada.

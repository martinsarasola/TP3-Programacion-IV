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

## Autenticación

Configurar un `JWT_SECRET` largo, aleatorio y privado en `backend/.env`, y reiniciar el servidor. Los endpoints son `POST /api/auth/register`, `POST /api/auth/login` y `GET /api/auth/me` (este último requiere `Authorization: Bearer <token>`). Hay solicitudes de ejemplo en `backend/http/auth.http`; sustituir los datos de prueba y el token. En un despliegue real, usar HTTPS para proteger las credenciales y los tokens en tránsito.

## API de gestión

Todas las rutas siguientes requieren `Authorization: Bearer <token>`. `vehiculos` y `conductores` admiten GET y POST en su colección, y GET, PUT y DELETE en `/:id`. PUT requiere todos los campos de la entidad. `viajes` admite GET y POST en la colección y GET en `/:id`. Los historiales y totales se consultan en `/:id/viajes` y `/:id/kilometros` de vehículos o conductores. No se admiten parámetros de consulta.

Los listados e historiales devuelven arreglos; la creación devuelve el objeto creado con HTTP 201, la modificación el objeto actualizado y la eliminación HTTP 204. Los totales devuelven `{ "total_kilometros": "200.00" }`; MySQL devuelve los valores DECIMAL como texto para conservar precisión. Las fechas de licencia usan `AAAA-MM-DD` y las de viaje `AAAA-MM-DD HH:mm:ss`. Consultar `backend/http/api.http` para los cuerpos completos. Una referencia inexistente o entrada inválida devuelve 400, una ruta protegida sin token 401, un recurso inexistente 404 y un conflicto de unicidad o borrado con viajes 409.

Para verificar el backend contra la base configurada, ejecutar `npm run test:api` desde `backend`. La prueba inserta y luego elimina únicamente sus propios registros temporales; requiere acceso de escritura a esa base.

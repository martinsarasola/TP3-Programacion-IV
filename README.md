# TP3 - Programación IV

Sistema de gestión de transporte desarrollado con **React + Vite (JavaScript)** en el frontend, **Express.js** en el backend y **MySQL** para persistencia de datos.

## Requisitos

- Node.js y npm.
- Servidor MySQL en ejecución.
- Git para clonar el repositorio.

## Instalación

Clonar el repositorio y acceder a su carpeta:

```powershell
git clone https://github.com/martinsarasola/TP3-Programacion-IV.git
cd TP3-Programacion-IV
```

Instalar las dependencias de ambos proyectos usando los archivos de bloqueo existentes:

```powershell
cd backend
npm ci
cd ..\frontend
npm ci
cd ..
```

Antes de iniciar la aplicación, configurar la base de datos y las variables de entorno siguiendo la sección siguiente.

## Base de datos

Crear una base MySQL dedicada. Por ejemplo, ejecutar lo siguiente desde un cliente MySQL con una cuenta autorizada:

```sql
CREATE DATABASE transportos CHARACTER SET utf8mb4;
```

La cuenta utilizada por la aplicación debe tener permisos sobre esa base.

Desde la raíz del proyecto, copiar el archivo de ejemplo de configuración:

```powershell
Copy-Item backend/.env.example backend/.env
```

Completar las variables de `backend/.env` con los valores de la instalación local:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=USUARIO_MYSQL
DB_PASSWORD=CONTRASEÑA_MYSQL
DB_NAME=transportos
JWT_SECRET=SECRETO_LARGO_ALEATORIO_Y_PRIVADO
```

Los valores son ejemplos: reemplazarlos por las credenciales y el secreto reales. **No compartir ni versionar `backend/.env`.** Si se utiliza otro nombre de base de datos, actualizar `DB_NAME` para que coincida.

Ejecutar `backend/sql/schema.sql` sobre la base creada. Por ejemplo, desde la raíz del proyecto en PowerShell, si el cliente `mysql` está disponible en el `PATH`:

```powershell
Get-Content -Raw backend/sql/schema.sql | mysql --host=127.0.0.1 --user=USUARIO_MYSQL --password transportos
```

El cliente solicitará la contraseña. Ajustar el ejecutable, usuario, puerto y nombre de base según la instalación.

El esquema utiliza `CREATE TABLE IF NOT EXISTS`: ejecutarlo nuevamente conserva los datos, pero **no migra ni valida tablas preexistentes**. Las restricciones únicas sobre email, patente, documento y licencia son decisiones de diseño.

Para comprobar la conexión del backend, consultar `GET /api/health/db` una vez iniciado el servidor.

### Restricción de fechas de viajes

La fecha de llegada debe ser **estrictamente posterior** a la de salida.

Si se trabaja sobre una base ya existente, ejecutar `backend/sql/strict_trip_dates_existing.sql` con un cliente MySQL para aplicar la restricción a futuras inserciones y actualizaciones sin modificar los viajes históricos. Para ello, el usuario de MySQL necesita el privilegio `TRIGGER`.

Los viajes anteriores con fechas iguales se conservan, pero deben corregirse antes de actualizarlos. Una base nueva creada con `schema.sql` ya incorpora la restricción estricta.

## Ejecución

Iniciar el backend y el frontend en **terminales separadas**, desde la raíz del repositorio:

**Terminal 1 — Backend**

```powershell
cd backend
npm run dev
```

**Terminal 2 — Frontend**

```powershell
cd frontend
npm run dev
```

Por defecto, el frontend estará disponible en **http://localhost:5173** y el backend escuchará en el **puerto 3000**. Vite utiliza un proxy para enviar las solicitudes `/api` al backend. Si se cambia el puerto del backend, también debe actualizarse el destino del proxy en `frontend/vite.config.js`.

Para ejecutar el backend sin modo de observación:

```powershell
cd backend
npm start
```

Para compilar el frontend:

```powershell
cd frontend
npm run build
```

## Autenticación

Configurar un `JWT_SECRET` largo, aleatorio y privado en `backend/.env` y reiniciar el servidor si se modifica.

Endpoints disponibles:

- `POST /api/auth/register` — Registro de usuario.
- `POST /api/auth/login` — Inicio de sesión.
- `GET /api/auth/me` — Consulta de sesión autenticada; requiere `Authorization: Bearer <token>`.

El backend almacena las contraseñas mediante **bcrypt** y utiliza **JWT y Passport** para proteger las rutas. Los tokens JWT expiran a las **4 horas**.

El frontend mantiene el token en `sessionStorage` durante la sesión de la pestaña y lo elimina al cerrar sesión o recibir un `401` de una ruta protegida. Al recargar, verifica la sesión mediante `/api/auth/me`.

Hay solicitudes de ejemplo en `backend/http/auth.http`; sustituir los datos de prueba y el token antes de utilizarlas.

**Seguridad:** en un despliegue real, utilizar **HTTPS** para proteger credenciales y tokens durante la transmisión. El uso de HTTP en `localhost` corresponde al entorno de desarrollo y no implica transporte cifrado.

## API de gestión

Todas las rutas de gestión requieren el encabezado `Authorization: Bearer <token>`.

| Recurso | Operaciones |
|---|---|
| `/api/vehiculos` | `GET`, `POST` |
| `/api/vehiculos/:id` | `GET`, `PUT`, `DELETE` |
| `/api/conductores` | `GET`, `POST` |
| `/api/conductores/:id` | `GET`, `PUT`, `DELETE` |
| `/api/viajes` | `GET`, `POST` |
| `/api/viajes/:id` | `GET` |
| `/api/vehiculos/:id/viajes` | `GET` — Historial por vehículo |
| `/api/conductores/:id/viajes` | `GET` — Historial por conductor |
| `/api/vehiculos/:id/kilometros` | `GET` — Total de kilómetros del vehículo |
| `/api/conductores/:id/kilometros` | `GET` — Total de kilómetros del conductor |

`PUT` requiere enviar todos los campos de la entidad. No se admiten parámetros de consulta.

Los listados e historiales devuelven arreglos; las creaciones devuelven **HTTP 201** y el objeto creado; las modificaciones devuelven el objeto actualizado; y las eliminaciones exitosas devuelven **HTTP 204** sin cuerpo.

Los totales tienen una estructura como esta:

```json
{ "total_kilometros": "200.00" }
```

MySQL devuelve los valores `DECIMAL` como texto para conservar precisión. Las fechas de licencia utilizan `AAAA-MM-DD` y las de viajes `AAAA-MM-DD HH:mm:ss`.

Los códigos de error utilizados incluyen:

- `400`: datos o referencias inválidos.
- `401`: solicitud sin autenticación válida.
- `404`: recurso inexistente.
- `409`: conflicto de unicidad o intento de eliminar una entidad con viajes asociados.

Consultar `backend/http/api.http` para ver ejemplos de solicitudes y sus cuerpos completos.

## Pruebas

Para verificar el backend contra la base MySQL configurada:

```powershell
cd backend
npm run test:api
```

La prueba inserta y posteriormente elimina **únicamente sus propios registros temporales**; requiere permisos de escritura sobre la base configurada.

Para comprobar que el frontend compila:

```powershell
cd frontend
npm run build
```

-- Execute against the intended database. Existing tables and data are preserved.
-- UNIQUE constraints on email, patente, documento and licencia are design choices.
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehiculos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  patente VARCHAR(20) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  capacidad_carga DECIMAL(10,2) UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculos_patente (patente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conductores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  numero_documento VARCHAR(30) NOT NULL,
  numero_licencia VARCHAR(30) NOT NULL,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conductores_documento (numero_documento),
  UNIQUE KEY uq_conductores_licencia (numero_licencia),
  CONSTRAINT chk_conductores_fechas CHECK (fecha_vencimiento_licencia >= fecha_alta_licencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS viajes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehiculo_id INT UNSIGNED NOT NULL,
  conductor_id INT UNSIGNED NOT NULL,
  fecha_salida DATETIME NOT NULL,
  fecha_llegada DATETIME NOT NULL,
  origen VARCHAR(150) NOT NULL,
  destino VARCHAR(150) NOT NULL,
  kilometros DECIMAL(10,2) UNSIGNED NOT NULL,
  observaciones TEXT,
  PRIMARY KEY (id),
  CONSTRAINT fk_viajes_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_viajes_conductor FOREIGN KEY (conductor_id) REFERENCES conductores (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT chk_viajes_fechas CHECK (fecha_llegada >= fecha_salida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

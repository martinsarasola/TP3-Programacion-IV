-- Para una base existente: conserva los viajes históricos, incluso si tienen fechas iguales.
-- Bloquea nuevas inserciones y actualizaciones que no cumplan la regla estricta.
-- Ejecutar en el cliente mysql sobre la base del proyecto, con privilegio TRIGGER.
DELIMITER //
CREATE TRIGGER IF NOT EXISTS viajes_fecha_estricta_insert
BEFORE INSERT ON viajes FOR EACH ROW
BEGIN
  IF NEW.fecha_llegada <= NEW.fecha_salida THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La llegada debe ser posterior a la salida.';
  END IF;
END//
CREATE TRIGGER IF NOT EXISTS viajes_fecha_estricta_update
BEFORE UPDATE ON viajes FOR EACH ROW
BEGIN
  IF NEW.fecha_llegada <= NEW.fecha_salida THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La llegada debe ser posterior a la salida.';
  END IF;
END//
DELIMITER ;

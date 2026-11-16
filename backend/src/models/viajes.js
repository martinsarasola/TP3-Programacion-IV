import { getPool } from '../config/db.js';

const selection = `SELECT t.id, t.vehiculo_id, t.conductor_id, t.fecha_salida, t.fecha_llegada,
  t.origen, t.destino, t.kilometros, t.observaciones,
  v.marca AS vehiculo_marca, v.modelo AS vehiculo_modelo, v.patente AS vehiculo_patente,
  c.nombre AS conductor_nombre, c.apellido AS conductor_apellido
  FROM viajes t JOIN vehiculos v ON v.id=t.vehiculo_id JOIN conductores c ON c.id=t.conductor_id`;

export async function listTrips() { const [rows] = await getPool().query(`${selection} ORDER BY t.id`); return rows; }
export async function findTrip(id) { const [rows] = await getPool().execute(`${selection} WHERE t.id=?`, [id]); return rows[0]; }
export async function tripsFor(kind, id) {
  const column = kind === 'vehiculo' ? 'vehiculo_id' : 'conductor_id';
  const [rows] = await getPool().execute(`${selection} WHERE t.${column}=? ORDER BY t.fecha_salida, t.id`, [id]);
  return rows;
}
export async function totalFor(kind, id) {
  const column = kind === 'vehiculo' ? 'vehiculo_id' : 'conductor_id';
  const [[row]] = await getPool().execute(`SELECT COALESCE(SUM(kilometros), 0) AS total_kilometros FROM viajes WHERE ${column}=?`, [id]);
  return row.total_kilometros;
}
export async function createTrip(data) {
  const fields = ['vehiculo_id','conductor_id','fecha_salida','fecha_llegada','origen','destino','kilometros','observaciones'];
  const [result] = await getPool().execute(`INSERT INTO viajes (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, fields.map(f => data[f] ?? null));
  return result.insertId;
}

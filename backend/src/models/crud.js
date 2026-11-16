import { getPool } from '../config/db.js';

export function createModel(table, fields) {
  const select = fields.join(', ');
  return {
    async list() { const [rows] = await getPool().query(`SELECT id, ${select} FROM ${table} ORDER BY id`); return rows; },
    async find(id) { const [rows] = await getPool().execute(`SELECT id, ${select} FROM ${table} WHERE id = ?`, [id]); return rows[0]; },
    async create(data) { const [result] = await getPool().execute(`INSERT INTO ${table} (${select}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map(f => data[f])); return result.insertId; },
    async update(id,data) { const [result] = await getPool().execute(`UPDATE ${table} SET ${fields.map(f => f+' = ?').join(', ')} WHERE id = ?`, [...fields.map(f => data[f]),id]); return result.affectedRows; },
    async remove(id) { const [result] = await getPool().execute(`DELETE FROM ${table} WHERE id = ?`, [id]); return result.affectedRows; },
  };
}

import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import jwt from 'jsonwebtoken';
import { getPool } from '../src/config/db.js';

const pool = getPool();
const suffix = randomBytes(8).toString('hex');
const email = `qa-${suffix}@example.com`;
const created = { user: null, vehicles: [], drivers: [], trips: [] };
const port = 31883;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['src/server.js'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore','pipe','pipe'] });
let output = '';
server.stdout.on('data', chunk => { output += chunk; });
server.stderr.on('data', chunk => { output += chunk; });
let token;
async function request(method, path, body, auth = true) {
  const response = await fetch(base + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}
async function expect(method, path, status, body) {
  const response = await request(method, path, body);
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(response.data)}`);
  return response.data;
}
try {
  let ready = false;
  for (let i=0;i<60;i++) { if (server.exitCode !== null) throw new Error('El servidor no inició'); try { const response=await fetch(base+'/api/health'); if(response.ok && output.includes(String(port))) {ready=true;break;} } catch {} await new Promise(resolve=>setTimeout(resolve,100)); }
  assert.ok(ready, 'Servidor de prueba no disponible');
  const [user] = await pool.execute('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)', ['QA temporal',email,'temporary-test-hash']);
  created.user = user.insertId;
  token = jwt.sign({}, process.env.JWT_SECRET, { subject: String(user.insertId), expiresIn: '4h' });
  assert.equal((await request('GET','/api/vehiculos',undefined,false)).status,401);
  const invalidToken=await fetch(base+'/api/vehiculos',{headers:{Authorization:'Bearer token.invalido'}});
  assert.equal(invalidToken.status,401);
  await expect('GET','/api/health?extra=1',400);
  await expect('GET','/api/auth/me?extra=1',400);
  const vehicle = { marca:'QA',modelo:'Original',patente:suffix,anio:2020,capacidad_carga:500.25 };
  const driver = { nombre:'QA',apellido:'Original',numero_documento:suffix,numero_licencia:suffix,fecha_alta_licencia:'2020-01-01',fecha_vencimiento_licencia:'2030-01-01' };
  for (const [method,path] of [['GET','/api/vehiculos'],['GET','/api/vehiculos/1'],['POST','/api/vehiculos'],['PUT','/api/vehiculos/1'],['DELETE','/api/vehiculos/1'],['GET','/api/conductores'],['GET','/api/conductores/1'],['POST','/api/conductores'],['PUT','/api/conductores/1'],['DELETE','/api/conductores/1'],['GET','/api/viajes'],['GET','/api/viajes/1'],['POST','/api/viajes'],['GET','/api/vehiculos/1/viajes'],['GET','/api/vehiculos/1/kilometros'],['GET','/api/conductores/1/viajes'],['GET','/api/conductores/1/kilometros']]) assert.equal((await request(method,path,undefined,false)).status,401,`Protección ${method} ${path}`);
  console.log('Protección sin token en las 17 rutas: OK');
  const v=await expect('POST','/api/vehiculos',201,vehicle);created.vehicles.push(v.id);
  const v2=await expect('POST','/api/vehiculos',201,{...vehicle,patente:suffix+'b'});created.vehicles.push(v2.id);
  assert.equal((await expect('GET','/api/vehiculos',200)).some(x=>x.id===v.id),true);
  assert.equal((await expect('GET',`/api/vehiculos/${v.id}`,200)).patente,suffix);
  assert.equal((await expect('PUT',`/api/vehiculos/${v.id}`,200,{...vehicle,modelo:'Actualizado'})).modelo,'Actualizado');
  await expect('POST','/api/vehiculos',409,vehicle);
  await expect('DELETE',`/api/vehiculos/${v2.id}`,204);created.vehicles=created.vehicles.filter(id=>id!==v2.id);
  console.log('QA-09–12: CRUD y duplicado de vehículo OK');
  const d=await expect('POST','/api/conductores',201,driver);created.drivers.push(d.id);
  const d2=await expect('POST','/api/conductores',201,{...driver,numero_documento:suffix+'b',numero_licencia:suffix+'b'});created.drivers.push(d2.id);
  assert.equal((await expect('GET','/api/conductores',200)).some(x=>x.id===d.id),true);
  assert.equal((await expect('PUT',`/api/conductores/${d.id}`,200,{...driver,apellido:'Actualizado'})).apellido,'Actualizado');
  await expect('POST','/api/conductores',409,driver);
  await expect('POST','/api/conductores',409,{...driver,numero_documento:suffix+'otro'});
  await expect('DELETE',`/api/conductores/${d2.id}`,204);created.drivers=created.drivers.filter(id=>id!==d2.id);
  console.log('QA-13–14: CRUD y duplicado de conductor OK');
  await expect('POST','/api/vehiculos',400,{...vehicle,marca:''});
  await expect('POST','/api/conductores',400,{...driver,fecha_vencimiento_licencia:'2019-01-01'});
  await expect('GET','/api/vehiculos/abc',400); await expect('GET','/api/vehiculos?desconocido=1',400);
  await expect('GET','/api/vehiculos/4294967295',404); await expect('GET','/api/conductores/4294967295',404); await expect('GET','/api/viajes/4294967295',404);
  console.log('QA-15 backend y QA-16: validaciones y 404 OK');
  const trip={vehiculo_id:v.id,conductor_id:d.id,fecha_salida:'2026-01-01 08:00:00',fecha_llegada:'2026-01-01 09:00:00',origen:'A',destino:'B',kilometros:120,observaciones:null};
  assert.equal(Number((await expect('GET',`/api/vehiculos/${v.id}/kilometros`,200)).total_kilometros),0);
  assert.equal(Number((await expect('GET',`/api/conductores/${d.id}/kilometros`,200)).total_kilometros),0);
  const t=await expect('POST','/api/viajes',201,trip);created.trips.push(t.id);
  const t2=await expect('POST','/api/viajes',201,{...trip,kilometros:80});created.trips.push(t2.id);
  assert.equal((await expect('GET',`/api/viajes/${t.id}`,200)).vehiculo_id,v.id);
  assert.equal((await expect('GET','/api/viajes',200)).some(x=>x.id===t.id),true);
  const badVehicle=await expect('POST','/api/viajes',400,{...trip,vehiculo_id:4294967295});
  assert.ok(badVehicle.details.some(item=>item.field==='vehiculo_id' && item.message));
  const badDriver=await expect('POST','/api/viajes',400,{...trip,conductor_id:4294967295});
  assert.ok(badDriver.details.some(item=>item.field==='conductor_id' && item.message));
  const badKm=await expect('POST','/api/viajes',400,{...trip,kilometros:-1});
  assert.ok(badKm.details.some(item=>item.field==='kilometros' && item.message));
  const badDate=await expect('POST','/api/viajes',400,{...trip,fecha_llegada:'2026-01-01 07:00:00'});
  assert.ok(badDate.details.some(item=>item.field==='fecha_llegada' && item.message));
  const badFormat=await expect('POST','/api/viajes',400,{...trip,fecha_salida:'2026-11-16T19:11'});
  assert.ok(badFormat.details.some(item=>item.field==='fecha_salida' && item.message.includes('AAAA-MM-DD')));
  const missing=await expect('POST','/api/viajes',400,{...trip,origen:''});
  assert.ok(missing.details.some(item=>item.field==='origen' && item.message));
  await expect('DELETE',`/api/vehiculos/${v.id}`,409);await expect('DELETE',`/api/conductores/${d.id}`,409);
  const hv=await expect('GET',`/api/vehiculos/${v.id}/viajes`,200), hd=await expect('GET',`/api/conductores/${d.id}/viajes`,200);
  assert.equal(hv.length,2);assert.equal(hd.length,2);assert.ok(hv.every(x=>x.vehiculo_id===v.id));assert.ok(hd.every(x=>x.conductor_id===d.id));
  assert.equal(Number((await expect('GET',`/api/vehiculos/${v.id}/kilometros`,200)).total_kilometros),200);
  assert.equal(Number((await expect('GET',`/api/conductores/${d.id}/kilometros`,200)).total_kilometros),200);
  const otherVehicle=await expect('POST','/api/vehiculos',201,{...vehicle,patente:suffix+'c'});created.vehicles.push(otherVehicle.id);
  const otherDriver=await expect('POST','/api/conductores',201,{...driver,numero_documento:suffix+'c',numero_licencia:suffix+'c'});created.drivers.push(otherDriver.id);
  const otherTrip=await expect('POST','/api/viajes',201,{...trip,vehiculo_id:otherVehicle.id,conductor_id:otherDriver.id,kilometros:10});created.trips.push(otherTrip.id);
  assert.equal((await expect('GET',`/api/vehiculos/${v.id}/viajes`,200)).length,2);
  assert.equal((await expect('GET',`/api/conductores/${d.id}/viajes`,200)).length,2);
  assert.equal(Number((await expect('GET',`/api/vehiculos/${v.id}/kilometros`,200)).total_kilometros),200);
  assert.equal(Number((await expect('GET',`/api/conductores/${d.id}/kilometros`,200)).total_kilometros),200);
  assert.equal(Number((await expect('GET',`/api/vehiculos/${otherVehicle.id}/kilometros`,200)).total_kilometros),10);
  await expect('GET','/api/vehiculos/4294967295/viajes',404);
  const equalTime='2026-11-16 19:11:00';
  const equal=await expect('POST','/api/viajes',400,{...trip,vehiculo_id:otherVehicle.id,conductor_id:otherDriver.id,fecha_salida:equalTime,fecha_llegada:equalTime,origen:'asd',destino:'asd',kilometros:123123});
  assert.ok(equal.details.some(item=>item.field==='fecha_llegada' && item.message==='La llegada debe ser posterior a la salida.'));
  const later='2026-11-16 19:11:01';
  const valid=await expect('POST','/api/viajes',201,{...trip,vehiculo_id:otherVehicle.id,conductor_id:otherDriver.id,fecha_salida:equalTime,fecha_llegada:later,origen:'asd',destino:'asd',kilometros:123123});created.trips.push(valid.id);
  const [[stored]]=await pool.execute('SELECT fecha_salida,fecha_llegada,kilometros,observaciones FROM viajes WHERE id=?',[valid.id]);
  assert.equal(stored.fecha_salida,equalTime);assert.equal(stored.fecha_llegada,later);assert.equal(stored.kilometros,'123123.00');assert.equal(stored.observaciones,null);
  await assert.rejects(pool.execute('UPDATE viajes SET fecha_llegada=fecha_salida WHERE id=?',[valid.id]), e => ['ER_SIGNAL_EXCEPTION','ER_CHECK_CONSTRAINT_VIOLATED'].includes(e.code));
  await assert.rejects(pool.execute('INSERT INTO viajes (vehiculo_id,conductor_id,fecha_salida,fecha_llegada,origen,destino,kilometros) VALUES (?,?,?,?,?,?,?)',[otherVehicle.id,otherDriver.id,equalTime,equalTime,'A','B',1]), e => ['ER_SIGNAL_EXCEPTION','ER_CHECK_CONSTRAINT_VIOLATED'].includes(e.code));
  assert.equal(Number((await expect('GET',`/api/vehiculos/${otherVehicle.id}/kilometros`,200)).total_kilometros),123133);
  assert.equal(Number((await expect('GET',`/api/conductores/${otherDriver.id}/kilometros`,200)).total_kilometros),123133);
  console.log('Fechas iguales rechazadas, fecha posterior persistida y restricciones SQL: OK');
  console.log('QA-17–22: viajes, integridad, historiales, 120+80=200 y cero OK');
} catch (error) { console.error('PRUEBA FALLIDA:',error.message); process.exitCode=1; }
finally {
  try {
    for(const id of created.trips) await pool.execute('DELETE FROM viajes WHERE id=?',[id]);
    for(const id of created.vehicles) await pool.execute('DELETE FROM vehiculos WHERE id=?',[id]);
    for(const id of created.drivers) await pool.execute('DELETE FROM conductores WHERE id=?',[id]);
    if(created.user) await pool.execute('DELETE FROM usuarios WHERE id=?',[created.user]);
    console.log('Limpieza de registros temporales: OK');
  } catch(error) { console.error('Fallo de limpieza:',error.code); process.exitCode=1; }
  await pool.end();server.kill();
}

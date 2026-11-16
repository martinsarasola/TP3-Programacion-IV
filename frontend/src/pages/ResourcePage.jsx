import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const definitions = {
  vehiculos: { title:'Vehículos', one:'vehículo', subtitle:'Administrá los vehículos de tu flota.', fields:[
    ['marca','Marca','text',100],['modelo','Modelo','text',100],['patente','Patente','text',20],['anio','Año','number'],['capacidad_carga','Capacidad de carga','decimal'] ] },
  conductores: { title:'Conductores', one:'conductor', subtitle:'Gestioná conductores y sus licencias.', fields:[
    ['nombre','Nombre','text',100],['apellido','Apellido','text',100],['numero_documento','Número de documento','text',30],['numero_licencia','Número de licencia','text',30],['fecha_alta_licencia','Alta de licencia','date'],['fecha_vencimiento_licencia','Vencimiento de licencia','date'] ] },
};
function validate(data, config) {
  const errors={};
  for (const [name,label,type,max] of config.fields) {
    const value=String(data[name] ?? '').trim();
    if (!value) errors[name]='Este campo es obligatorio.';
    else if (max && value.length>max) errors[name]=`Máximo ${max} caracteres.`;
    else if (type==='number' && (!/^\d+$/.test(value) || Number(value)<1 || Number(value)>65535)) errors[name]='Ingresá un año válido.';
    else if (type==='decimal' && !/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) errors[name]='Ingresá un valor no negativo con hasta dos decimales.';
  }
  if (data.fecha_alta_licencia && data.fecha_vencimiento_licencia && data.fecha_vencimiento_licencia<data.fecha_alta_licencia) errors.fecha_vencimiento_licencia='El vencimiento debe ser posterior o igual al alta.';
  return errors;
}
export default function ResourcePage({ type }) {
  const config=definitions[type]; const blank=()=>Object.fromEntries(config.fields.map(([key])=>[key,'']));
  const [rows,setRows]=useState([]);const [data,setData]=useState(blank);const [editing,setEditing]=useState(null);const [errors,setErrors]=useState({});const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [pendingDelete,setPendingDelete]=useState(null);
  async function load() { setLoading(true);try{setRows(await api('/'+type));setError('');}catch(e){setError(e.message);}finally{setLoading(false);} }
  useEffect(()=>{load();},[type]);
  function reset(){setEditing(null);setData(blank());setErrors({});}
  async function submit(e){e.preventDefault();setError('');setMessage('');const found=validate(data,config);setErrors(found);if(Object.keys(found).length)return;setBusy(true);
    try { const payload=Object.fromEntries(config.fields.map(([key])=>[key,typeof data[key]==='string'?data[key].trim():data[key]]));await api('/'+type+(editing ? '/'+editing : ''),{method:editing?'PUT':'POST',data:payload});setMessage(editing ? 'Cambios guardados.' : 'Registro creado.');reset();await load(); }
    catch(e){setError(e.status===409 ? 'Ya existe un registro con esos datos únicos.' : e.status===404 ? 'El registro ya no existe. Actualizá la lista.' : e.message);if(e.details) setErrors(Object.fromEntries(e.details.map(x=>[x.field,x.message])));}finally{setBusy(false);}
  }
  function edit(row){setData(Object.fromEntries(config.fields.map(([key])=>[key,String(row[key] ?? '')])));setEditing(row.id);setErrors({});setError('');setMessage('');document.getElementById('resource-form')?.scrollIntoView({behavior:'smooth'});}
  async function remove(row){setPendingDelete(null);setError('');setMessage('');try{await api('/'+type+'/'+row.id,{method:'DELETE'});if(editing===row.id)reset();setMessage('Registro eliminado.');await load();}catch(e){setError(e.status===409 ? 'No se puede eliminar: tiene viajes asociados.' : e.status===404 ? 'El registro ya no existe. Actualizá la lista.' : e.message);}}
  return <section><div className="page-heading"><div><span className="eyebrow">GESTIÓN DE FLOTA</span><h1>{config.title}</h1><p>{config.subtitle}</p></div><span className="count">{rows.length} registrados</span></div>
    {message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}{pendingDelete && <div className="confirm-box" role="alertdialog" aria-label={`Confirmar eliminación de ${config.one}`}><p>¿Eliminar este {config.one}? Esta acción no se puede deshacer.</p><div className="actions"><button className="secondary small" onClick={()=>setPendingDelete(null)}>Cancelar</button><button className="danger-button small" onClick={()=>remove(pendingDelete)}>Confirmar eliminación</button></div></div>}
    <div className="card form-card" id="resource-form"><div className="section-heading"><div><h2>{editing ? 'Editar' : 'Agregar'} {config.one}</h2><p>Completá los datos para mantener la información actualizada.</p></div>{editing && <button className="secondary small" type="button" onClick={reset}>Cancelar edición</button>}</div>
      <form onSubmit={submit} noValidate><div className="form-grid">{config.fields.map(([name,label,type,max])=><label key={name}>{label}<input name={name} type={type==='decimal'?'number':type} step={type==='decimal'?'0.01':undefined} min={type==='decimal'?'0':type==='number'?'1':undefined} maxLength={max} value={data[name] ?? ''} onInput={e=>setData({...data,[name]:e.target.value})} aria-invalid={Boolean(errors[name])} />{errors[name] && <span className="field-error">{errors[name]}</span>}</label>)}</div><div className="form-actions"><button className="primary" disabled={busy}>{busy?'Guardando…':editing?'Guardar cambios':`Agregar ${config.one}`}</button></div></form>
    </div><div className="card table-card"><div className="section-heading"><div><h2>Listado de {config.title.toLowerCase()}</h2><p>Información registrada en el sistema.</p></div><button className="secondary small" onClick={load}>Actualizar</button></div>
    {loading ? <p className="empty">Cargando…</p> : !rows.length ? <p className="empty">Todavía no hay {config.title.toLowerCase()} registrados.</p> : <div className="table-scroll"><table><thead><tr>{config.fields.map(([,label])=><th key={label}>{label}</th>)}<th>Acciones</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}>{config.fields.map(([name])=><td key={name}>{row[name]}</td>)}<td className="row-actions"><button className="link" onClick={()=>edit(row)}>Editar</button><button className="link danger" onClick={()=>setPendingDelete(row)}>Eliminar</button></td></tr>)}</tbody></table></div>}</div>
  </section>;
}

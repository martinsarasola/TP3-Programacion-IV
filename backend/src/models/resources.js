import { createModel } from './crud.js';

export const vehicleModel = createModel('vehiculos', ['marca','modelo','patente','anio','capacidad_carga']);
export const driverModel = createModel('conductores', ['nombre','apellido','numero_documento','numero_licencia','fecha_alta_licencia','fecha_vencimiento_licencia']);

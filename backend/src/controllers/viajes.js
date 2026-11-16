import { vehicleModel, driverModel } from '../models/resources.js';
import { createTrip, findTrip, listTrips, tripsFor, totalFor } from '../models/viajes.js';

export async function list(_req,res) { res.json(await listTrips()); }
export async function get(req,res) { const trip=await findTrip(req.params.id); return trip ? res.json(trip) : res.status(404).json({ error: 'Viaje no encontrado' }); }
export async function create(req,res) {
  const [vehicle, driver] = await Promise.all([vehicleModel.find(req.body.vehiculo_id), driverModel.find(req.body.conductor_id)]);
  if (!vehicle || !driver) return res.status(400).json({ error: 'Vehículo o conductor inexistente' });
  const id=await createTrip(req.body);
  return res.status(201).json(await findTrip(id));
}
export function history(kind, model) {
  return async (req,res) => {
    if (!await model.find(req.params.id)) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.json(await tripsFor(kind,req.params.id));
  };
}
export function mileage(kind, model) {
  return async (req,res) => {
    if (!await model.find(req.params.id)) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.json({ total_kilometros: await totalFor(kind,req.params.id) });
  };
}

export function createController(model) {
  return {
    list: async (_req,res) => res.json(await model.list()),
    get: async (req,res) => { const row = await model.find(req.params.id); return row ? res.json(row) : res.status(404).json({ error: 'Recurso no encontrado' }); },
    create: async (req,res) => { const id = await model.create(req.body); return res.status(201).json(await model.find(id)); },
    update: async (req,res) => { const updated = await model.update(req.params.id,req.body); return updated ? res.json(await model.find(req.params.id)) : res.status(404).json({ error: 'Recurso no encontrado' }); },
    remove: async (req,res) => { const deleted = await model.remove(req.params.id); return deleted ? res.status(204).end() : res.status(404).json({ error: 'Recurso no encontrado' }); },
  };
}

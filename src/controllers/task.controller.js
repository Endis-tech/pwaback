import Task from "../models/Task.js";

const allowed = ['Pendiente', 'En Proceso', 'Completado'];

// 📌 Listar todas las tareas de un usuario
export async function list(req, res) {
  try {
    const items = await Task.find({ user: req.userId, delete: false })
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (err) {
    console.error("Error en list:", err);
    res.status(500).json({ message: "Error al obtener tareas" });
  }
}

// 📌 Crear una nueva tarea
export async function create(req, res) {
  try {
    const { title, description = '', status = 'Pendiente', clienteId } = req.body;
    if (!title) return res.status(400).json({ message: 'El título es requerido' });

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      status: allowed.includes(status) ? status : 'Pendiente',
      clienteId
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error("Error en create:", err);
    res.status(500).json({ message: "Error al crear tarea" });
  }
}

// 📌 Actualizar tarea existente con normalización de status
export async function update(req, res) {
  try {
    const { id } = req.params;
    let { title, description, status } = req.body;

    const allowed = ["Pendiente", "En Progreso", "Completada"];

    // Normalizar status (eliminar espacios y poner mayúscula inicial)
    if (status) {
      const normalized = allowed.find(
        (s) => s.toLowerCase().replace(/\s+/g, "") === status.toLowerCase().replace(/\s+/g, "")
      );
      if (!normalized) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      status = normalized;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title, description, status },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    res.json({ task });
  } catch (err) {
    console.error("Error en update:", err);
    res.status(500).json({ message: "Error al actualizar tarea" });
  }
}


// 📌 Eliminar tarea permanentemente
export async function remove(req, res) {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });

    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    res.json({ ok: true, message: "Tarea eliminada permanentemente" });
  } catch (err) {
    console.error("Error en remove:", err);
    res.status(500).json({ message: "Error al eliminar tarea" });
  }
}

// 📌 Bulk sync (offline/online)
export async function bulksync(req, res) {
  try {
    const { tasks = [] } = req.body;
    const mapping = [];

    for (const t of tasks) {
      if (!t.clienteId || !t.title) continue;

      let doc = await Task.findOne({ user: req.userId, clienteId: t.clienteId });

      if (!doc) {
        doc = await Task.create({
          user: req.userId,
          title: t.title,
          description: t.description || '',
          status: allowed.includes(t.status) ? t.status : 'Pendiente',
          clienteId: t.clienteId
        });
      } else {
        doc.title = t.title ?? doc.title;
        doc.description = t.description ?? doc.description;
        if (t.status && allowed.includes(t.status)) doc.status = t.status;
        await doc.save();
      }

      mapping.push({ clienteId: t.clienteId, serverId: String(doc._id) });
    }

    res.json({ mapping });
  } catch (err) {
    console.error("Error en bulksync:", err);
    res.status(500).json({ message: "Error en sincronización de tareas" });
  }
}
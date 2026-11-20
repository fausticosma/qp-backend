import express from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../schemas/Usuario.js';
import Venta from '../schemas/Venta.js';

const router = express.Router();

// Quita la contraseña y los campos internos de Mongo antes de mandar el usuario al cliente
function limpiar(usuario) {
  const { contraseña, _id, __v, ...resto } = usuario;
  return resto;
}

// Calcula el próximo id (el más alto + 1), como hacía proximoId con los JSON
async function proximoId() {
  const ultimo = await Usuario.findOne().sort({ id: -1 }).select('id').lean();
  return ultimo ? ultimo.id + 1 : 1;
}

// POST /api/usuarios  -> registrar usuario nuevo
// body: { nombre, apellido, email, contraseña }
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña } = req.body;

    if (!nombre || !apellido || !email || !contraseña) {
      return res.status(400).json({
        error: 'Faltan datos. Se requiere nombre, apellido, email y contraseña.',
      });
    }

    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }

    // La contraseña se guarda encriptada, nunca en texto plano
    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await Usuario.create({
      id: await proximoId(),
      nombre,
      apellido,
      email,
      contraseña: hash,
      activo: true,
    });

    res.status(201).json(limpiar(nuevoUsuario.toObject()));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// PUT /api/usuarios/:id -> actualizar usuario existente
// body: cualquier combinación de { nombre, apellido, email, contraseña, activo }
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, apellido, email, contraseña, activo } = req.body;

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (apellido !== undefined) cambios.apellido = apellido;
    if (email !== undefined) cambios.email = email.toLowerCase();
    if (activo !== undefined) cambios.activo = activo;
    // Si cambia la contraseña, también se encripta
    if (contraseña !== undefined) cambios.contraseña = await bcrypt.hash(contraseña, 10);

    const usuario = await Usuario.findOneAndUpdate({ id }, cambios, {
      new: true,
      runValidators: true,
    }).lean();

    if (!usuario) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    res.json(limpiar(usuario));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email.' });
    }
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

// DELETE /api/usuarios/:id -> elimina un usuario, respetando integridad con ventas
// DELETE /api/usuarios/:id?forzar=true -> además elimina sus ventas asociadas
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuario = await Usuario.findOne({ id }).lean();

    if (!usuario) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    const ventasDelUsuario = await Venta.find({ id_usuario: id }).lean();
    const forzar = req.query.forzar === 'true';

    if (ventasDelUsuario.length > 0 && !forzar) {
      return res.status(409).json({
        error:
          'No se puede eliminar el usuario porque tiene ventas asociadas. ' +
          'Reasigná o eliminá esas ventas primero, o repetí la solicitud con ?forzar=true.',
        ventas_asociadas: ventasDelUsuario.map((v) => v.id),
      });
    }

    if (ventasDelUsuario.length > 0 && forzar) {
      await Venta.deleteMany({ id_usuario: id });
    }

    await Usuario.deleteOne({ id });

    res.json({
      mensaje: `Usuario ${id} eliminado correctamente.`,
      ventas_eliminadas: forzar ? ventasDelUsuario.map((v) => v.id) : [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

export default router;
import express from 'express';
import Venta from '../schemas/Venta.js';
import Producto from '../schemas/producto.js';
import Usuario from '../schemas/Usuario.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

// Calcula el próximo id (el más alto + 1), como hacía proximoId con los JSON
async function proximoId() {
  const ultima = await Venta.findOne().sort({ id: -1 }).select('id').lean();
  return ultima ? ultima.id + 1 : 1;
}

// GET /api/ventas
// GET /api/ventas?id_usuario=1
router.get('/', async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const filtro = id_usuario ? { id_usuario: Number(id_usuario) } : {};

    const ventas = await Venta.find(filtro)
      .select('-_id -__v')
      .sort({ id: 1 })
      .lean();

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las ventas.' });
  }
});

// POST /api/ventas -> crea una venta nueva (requiere estar logueado: token JWT)
// body: { dirección, productos: [{ id_producto, cantidad }] }
router.post('/', verificarToken, async (req, res) => {
  try {
    const { dirección, productos } = req.body;

    // El usuario sale del token, no del body: nadie puede comprar a nombre de otro
    const id_usuario = req.usuario.id;

    if (!dirección || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        error: 'Se requiere dirección y un array de productos con al menos un ítem.',
      });
    }

    const usuario = await Usuario.findOne({ id: id_usuario }).lean();
    if (!usuario) {
      return res.status(404).json({ error: `No existe un usuario con id ${id_usuario}` });
    }

    let total = 0;
    const items = [];

    for (const item of productos) {
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return res.status(400).json({
          error: `La cantidad del producto ${item.id_producto} tiene que ser un número entero mayor a 0.`,
        });
      }

      const producto = await Producto.findOne({ id: item.id_producto }).lean();
      if (!producto) {
        return res.status(404).json({
          error: `No existe un producto con id ${item.id_producto}`,
        });
      }

      // El total se calcula con los precios de la base, no con lo que mande el front
      total += producto.precio * cantidad;
      items.push({ id_producto: item.id_producto, cantidad });
    }

    const nuevaVenta = await Venta.create({
      id: await proximoId(),
      id_usuario,
      fecha: new Date().toISOString().slice(0, 10),
      total,
      dirección,
      pagado: false,
      productos: items,
    });

    const { _id, __v, ...venta } = nuevaVenta.toObject();
    res.status(201).json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la venta.' });
  }
});

export default router;
import express from 'express';
import Producto from '../schemas/producto.js';

const router = express.Router();

// GET /api/productos
// GET /api/productos?categoria=tortas
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = categoria ? { categoria: categoria.toLowerCase() } : {};

    const productos = await Producto.find(filtro)
      .select('-_id -__v')
      .sort({ id: 1 })
      .lean();

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const producto = await Producto.findOne({ id }).select('-_id -__v').lean();

    if (!producto) {
      return res.status(404).json({ error: `No existe un producto con id ${id}` });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

export default router;
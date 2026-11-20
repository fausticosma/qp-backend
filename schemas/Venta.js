import mongoose from 'mongoose';

const ventaSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  id_usuario: { type: Number, required: true },
  fecha: { type: String, required: true },
  total: { type: Number, required: true },
  dirección: { type: String, required: true },
  pagado: { type: Boolean, default: false },
  productos: [
    {
      _id: false,
      id_producto: { type: Number, required: true },
      cantidad: { type: Number, required: true, min: 1 }
    }
  ]
});

export default mongoose.model('Venta', ventaSchema);
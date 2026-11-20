import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  imagen: String,
  categoria: String
});

export default mongoose.model('Producto', productoSchema);
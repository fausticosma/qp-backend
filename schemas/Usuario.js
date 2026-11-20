import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  contraseña: { type: String, required: true }, // acá va el hash de bcrypt, nunca la clave real
  activo: { type: Boolean, default: true }
});

export default mongoose.model('Usuario', usuarioSchema);
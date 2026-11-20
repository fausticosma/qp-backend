import 'dotenv/config';
import fs from 'fs';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Producto from '../schemas/producto.js';
import Usuario from '../schemas/Usuario.js';
import Venta from '../schemas/Venta.js';

const leerJSON = (archivo) =>
  JSON.parse(fs.readFileSync(new URL(`../data/${archivo}`, import.meta.url), 'utf-8'));

await mongoose.connect(process.env.MONGODB_URI);

// Productos
const productos = leerJSON('productos.json');
await Producto.deleteMany({});
await Producto.insertMany(productos);
console.log(`Se migraron ${productos.length} productos`);

// Usuarios (con la contraseña encriptada con bcrypt)
const usuarios = leerJSON('usuario.json');
const usuariosConHash = await Promise.all(
  usuarios.map(async (u) => ({
    ...u,
    contraseña: await bcrypt.hash(u.contraseña, 10)
  }))
);
await Usuario.deleteMany({});
await Usuario.insertMany(usuariosConHash);
console.log(`Se migraron ${usuariosConHash.length} usuarios`);

// Ventas
const ventas = leerJSON('ventas.json');
await Venta.deleteMany({});
await Venta.insertMany(ventas);
console.log(`Se migraron ${ventas.length} ventas`);

await mongoose.disconnect();
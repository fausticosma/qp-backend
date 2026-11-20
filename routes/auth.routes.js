import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from '../schemas/Usuario.js';

const router = express.Router();

// POST /api/login -> autentica un usuario y devuelve un token JWT
// body: { email, contraseña }
router.post('/', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ error: 'Se requiere email y contraseña.' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).lean();

    // bcrypt.compare compara la clave escrita contra el hash guardado
    const claveOk = usuario && (await bcrypt.compare(contraseña, usuario.contraseña));

    if (!claveOk) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'El usuario está inactivo.' });
    }

    // El token guarda quién es el usuario y vence en 2 horas
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { contraseña: _, _id, __v, ...usuarioSinContraseña } = usuario;
    res.json({ mensaje: 'Login exitoso', token, usuario: usuarioSinContraseña });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

export default router;
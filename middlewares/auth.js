import jwt from 'jsonwebtoken';

// Verifica el token JWT que viene en el header "Authorization: Bearer <token>"
export function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token. Iniciá sesión para continuar.' });
  }

  try {
    // Si el token es válido, guardamos los datos del usuario en req.usuario
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next(); // deja pasar a la ruta
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o vencido. Volvé a iniciar sesión.' });
  }
}
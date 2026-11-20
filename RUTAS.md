# Rutas de la API — Qué Pancito

Base URL local: `http://localhost:3000`

## Cómo correr el proyecto

1. `npm install`
2. Completar el `.env` (`MONGODB_URI`, `JWT_SECRET`, `PORT`).
3. Cargar los datos iniciales en MongoDB (productos, usuarios con contraseña hasheada y ventas): `node utils/seed.js`
4. `npm start`

> Ojo: `seed.js` borra y vuelve a cargar las tres colecciones.

## Autenticación

- Las contraseñas se guardan hasheadas con **bcrypt**. Nunca se devuelven en las respuestas.
- Al loguearse se recibe un **token JWT**. Las acciones de usuario logueado (comprar) lo exigen en el header:

```
Authorization: Bearer <token>
```

## Productos

### GET /api/productos
Lista todos los productos. Filtro opcional por categoría.
- Query params: `categoria` (opcional) — `tortas`, `cookies` o `postres`
- Ejemplo: `GET /api/productos?categoria=cookies`
- Respuesta 200: array de productos.

### GET /api/productos/:id
Devuelve un producto puntual por id.
- Ejemplo: `GET /api/productos/3`
- Respuesta 200: objeto producto.
- Respuesta 404: `{ "error": "No existe un producto con id 3" }`

## Usuarios

### POST /api/usuarios
Registra un usuario nuevo. La contraseña se guarda hasheada.
- Body (JSON):
```json
{
  "nombre": "Lucas",
  "apellido": "Díaz",
  "email": "lucas.diaz@mail.com",
  "contraseña": "lucas2026*"
}
```
- Respuesta 201: usuario creado (sin contraseña).
- Respuesta 400: faltan datos.
- Respuesta 409: el email ya está registrado.

### PUT /api/usuarios/:id
Actualiza datos de un usuario existente. Se puede mandar cualquier combinación de campos.
- Body (JSON), ejemplo:
```json
{
  "email": "nuevoemail@mail.com",
  "activo": false
}
```
- Respuesta 200: usuario actualizado (sin contraseña).
- Respuesta 404: usuario inexistente.

### DELETE /api/usuarios/:id
Elimina un usuario, respetando la integridad con sus ventas.
- Si el usuario tiene ventas asociadas y no se manda `?forzar=true` → **409**, no borra nada, devuelve los ids de las ventas asociadas.
- Si se manda `?forzar=true` → borra también esas ventas y luego el usuario.
- Ejemplo sin forzar: `DELETE /api/usuarios/3`
- Ejemplo forzando: `DELETE /api/usuarios/3?forzar=true`
- Respuesta 404: usuario inexistente.

## Login

### POST /api/login
Autentica un usuario y devuelve un token JWT.
- Body (JSON):
```json
{
  "email": "fausti.cosma@quepancito.com",
  "contraseña": "fc2026$Pan"
}
```
- Respuesta 200: `{ "mensaje": "Login exitoso", "token": "eyJ...", "usuario": {...} }` (sin contraseña)
- Respuesta 401: email o contraseña incorrectos.
- Respuesta 403: usuario inactivo.

## Ventas

### GET /api/ventas
Lista todas las ventas. Filtro opcional por usuario.
- Query params: `id_usuario` (opcional)
- Ejemplo: `GET /api/ventas?id_usuario=1`
- Respuesta 200: array de ventas.

### POST /api/ventas 🔒
**Requiere token JWT** (`Authorization: Bearer <token>`). El usuario de la venta se toma del token, por lo que no hace falta mandar `id_usuario`. Calcula el total automáticamente según los productos y valida que el usuario y los productos existan.
- Body (JSON):
```json
{
  "dirección": "Av. Colón 1500, Córdoba",
  "productos": [
    { "id_producto": 1, "cantidad": 1 },
    { "id_producto": 5, "cantidad": 2 }
  ]
}
```
- Respuesta 201: venta creada (con `id`, `fecha`, `total` y `pagado: false` calculados por el servidor).
- Respuesta 400: faltan datos o el array de productos está vacío.
- Respuesta 401: falta el token, o es inválido o está vencido.
- Respuesta 404: el usuario o alguno de los productos no existe.

---

## Resumen de integridad referencial

Al eliminar un usuario (`DELETE /api/usuarios/:id`), el servidor chequea si existen ventas en la colección de ventas de MongoDB con ese `id_usuario`. Si las hay, rechaza el borrado (409) salvo que se pida explícitamente `?forzar=true`, en cuyo caso elimina primero las ventas relacionadas y después el usuario, evitando dejar ventas con un `id_usuario` inexistente.
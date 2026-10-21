# 🥐 Qué Pancito (Back)

API REST de **Qué Pancito**, hecha con Node.js y Express. Proyecto de **Aplicaciones Web**.

Este es el repositorio del **back-end**. La interfaz está en otro repositorio:
👉 **[qp](https://github.com/fausticosma/qp)**

## Tecnologías

- Node.js + Express (ES Modules)
- `cors` para permitir pedidos desde el front
- `dotenv` para la configuración
- Archivos JSON como base de datos (solo para pruebas)

## Estructura

```
qp-backend/
├── index.js
├── routes/      # productos, usuarios, login, ventas
├── utils/       # lectura y escritura de los JSON
├── data/        # productos.json, usuario.json, ventas.json
└── RUTAS.md     # documentación de los endpoints
```

## Cómo correrlo

```bash
npm install
```

Creá un archivo `.env` en la raíz con:

```
PORT=3000
```

Y levantá el servidor:

```bash
npm start
```

Queda en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista productos (`?categoria=tortas`) |
| GET | `/api/productos/:id` | Producto por id |
| POST | `/api/usuarios` | Registrar usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |
| POST | `/api/login` | Iniciar sesión |
| GET | `/api/ventas` | Lista ventas (`?id_usuario=1`) |
| POST | `/api/ventas` | Crea una orden de compra |

El detalle completo de cada endpoint está en [`RUTAS.md`](RUTAS.md).

> Los datos se guardan en archivos JSON: sirve para pruebas, no para producción.

## Autor

Fausti Cosma
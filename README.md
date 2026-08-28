# Backend — SuperMarket

Sistema Web de Facturación e Inventario para Supermercados. Backend construido con Node.js, Express y MySQL.

## Proyecto

Backend del sistema de facturación e inventario para supermercados. Expone una API REST (prefijo `/api`) que será consumida por el frontend y por futuros módulos (autenticación, inventario, ventas, POS, e-commerce, reportes, etc.).

## Tecnologías

- Node.js
- Express
- MySQL

## Requisitos

- Node.js 18 o superior
- MySQL 8.x

## Instalación

```bash
npm install
```

## Variables de entorno

Copiar el archivo de ejemplo a `.env`:

```bash
cp .env.example .env
```

Luego completar los valores de conexión a MySQL:

| Variable | Descripción |
| --- | --- |
| `DB_HOST` | Host del servidor MySQL (normalmente `localhost`) |
| `DB_PORT` | Puerto de MySQL (normalmente `3306`) |
| `DB_NAME` | Nombre de la base de datos (debe ser `supermercadomarket`) |
| `DB_USER` | Usuario de MySQL |
| `DB_PASSWORD` | Contraseña de MySQL |

Nunca subir `.env` al repositorio (está excluido en `.gitignore`).

## Configuración de MySQL

### 1. Instalar MySQL 8.x

Tener instalado y en ejecución MySQL 8.x.

### 2. Crear `.env`

```bash
cp .env.example .env
```

### 3. Configurar credenciales

Editar `.env` y completar `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` con los datos del servidor MySQL.

### 4. Inicializar la base de datos

Este paso crea la base de datos, las tablas, los índices, los datos iniciales, los procedimientos almacenados, los triggers y las vistas:

```bash
npm run db:setup
```

### 5. Iniciar el backend

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

## Health Check

```bash
GET /api/health
```

## Catálogo

Módulo básico de catálogo (categorías y productos). Todas las respuestas usan el formato:

```json
{ "success": true, "message": "...", "data": { } }
```

### Categorías

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/categorias` | Lista todas las categorías |
| GET | `/api/categorias/:id` | Obtiene una categoría por ID |
| POST | `/api/categorias` | Crea una categoría |
| PUT | `/api/categorias/:id` | Actualiza una categoría |
| DELETE | `/api/categorias/:id` | Elimina una categoría |

Campos de categoría: `nombre` (obligatorio), `descripcion` (opcional), `activo` (opcional, `0` o `1`).

```bash
# Crear categoría
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Lácteos", "descripcion": "Productos lácteos"}'
```

### Productos

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/productos` | Lista productos (admite filtros) |
| GET | `/api/productos/:id` | Obtiene un producto por ID |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Actualiza un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

Campos de producto: `codigo_barras` (opcional, único), `nombre` (obligatorio), `descripcion`, `id_categoria`, `id_unidad_de_medida`, `precio_venta`, `precio_compra`, `precio_minimo`, `porcentaje_iva`, `caducidad` (`YYYY-MM-DD`), `activo` (`0` o `1`).

Filtros disponibles en `GET /api/productos` (query params):

- `nombre`: búsqueda parcial por nombre.
- `codigo_barras`: coincidencia exacta por código de barras.
- `id_categoria`: filtra por categoría.
- `activo`: filtra por estado (`0` o `1`).

```bash
# Listar productos que coincidan con "arroz"
curl "http://localhost:3000/api/productos?nombre=arroz"

# Buscar por código de barras
curl "http://localhost:3000/api/productos?codigo_barras=123456"

# Crear producto
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"codigo_barras": "7701234567890", "nombre": "Arroz", "id_categoria": 1, "precio_venta": 4500}'
```

## Proceso de instalación desde cero

```bash
git clone <URL_DEL_REPOSITORIO>
cd <proyecto>
npm install
cp .env.example .env
# Editar .env con las credenciales de MySQL
npm run db:setup
npm run dev
```

## Arquitectura

El backend sigue una arquitectura por capas dentro de `src/`:

- `config/` — Configuración de la aplicación (conexión a MySQL, variables de entorno).
- `controllers/` — Capa HTTP: reciben `req/res`, validan entrada y arman la respuesta.
- `models/` — Definición de las estructuras de datos del dominio.
- `routes/` — Definición de endpoints (sin lógica de negocio).
- `services/` — Lógica de negocio.
- `middlewares/` — Funciones transversales (manejo de errores, autenticación, etc.).
- `validators/` — Validación de los datos de entrada.
- `utils/` — Funciones de utilidad compartidas.

El directorio `database/` organiza el SQL como fuente única de verdad de la base de datos:

- `database/schema/` — `CREATE TABLE` por módulo, en orden de dependencias de claves foráneas.
- `database/seeds/` — `INSERT` de datos iniciales (roles, métodos de pago, tipos, configuración).
- `database/procedures/` — procedimientos almacenados.
- `database/triggers/` — triggers de auditoría, inventario y anomalías.
- `database/views/` — vistas para reportes y dashboard.
- `database/indexes/` — índices adicionales de rendimiento.
- `database/setup.sql` — script completo de inicialización (para ejecutar vía cliente MySQL).

`tests/` contiene las pruebas.

## Git

- `main` — rama estable de producción.
- `develop` — rama de integración.
- `feature/*` — ramas de trabajo por funcionalidad/módulo.

## Estado del proyecto

Actualmente se encuentra implementada la infraestructura inicial (servidor Express, conexión base a MySQL, manejo centralizado de errores), el endpoint de salud `GET /api/health` y la organización/automatización de la base de datos (`npm run db:setup`).

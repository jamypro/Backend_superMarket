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

Luego completar los valores de conexión a MySQL (host, puerto, nombre de base de datos, usuario y contraseña).

## Ejecución

```bash
npm run dev
```

## Producción

```bash
npm start
```

## Health Check

```bash
GET /api/health
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

El directorio `database/` agrupa los recursos de base de datos (esquema, seeds, procedimientos, triggers, vistas e índices) y `tests/` las pruebas.

## Git

- `main` — rama estable de producción.
- `develop` — rama de integración.
- `feature/*` — ramas de trabajo por funcionalidad/módulo.

## Estado del proyecto

Actualmente solo se encuentra implementada la infraestructura inicial (servidor Express, conexión base a MySQL, manejo centralizado de errores) y el endpoint de salud `GET /api/health`.

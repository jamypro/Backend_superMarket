# AGENTS.md — Reglas de OpenCode para el backend de SuperMarket

Este archivo define las reglas que OpenCode debe seguir durante todo el desarrollo del backend.

## Reglas generales

- Respetar la arquitectura por capas (`routes` → `controller` → `service` → `repository`/`models`).
- No modificar funcionalidades fuera del alcance de la tarea asignada.
- No eliminar código existente sin justificación clara.
- Utilizar variables de entorno (`.env`) para toda configuración sensible.
- Nunca almacenar credenciales, secretos ni llaves en el código fuente.
- Utilizar siempre consultas SQL parametrizadas (nunca concatenar strings SQL).
- No modificar la estructura de MySQL sin revisar primero el archivo SQL existente (`base_de_datos_SuperMarket.sql`).
- No instalar dependencias innecesarias; agregar paquetes solo cuando el módulo lo requiera.
- Validar los datos recibidos por la API antes de procesarlos.
- Utilizar el manejo centralizado de errores (middleware de errores) en lugar de `try/catch` con `res.status(500)` repetidos.
- Mantener nombres consistentes con el resto del código.
- Revisar los cambios (`git diff`, `git status`) antes de dar por finalizada una tarea.
- Ejecutar las pruebas antes de considerar una tarea terminada.

## Reglas de commits

MUY IMPORTANTE: OpenCode NO debe realizar commits automáticamente.

OpenCode puede revisar `git status` y `git diff` e informar los cambios realizados, pero NO debe ejecutar `git commit`, `git push` ni `git merge` a menos que el usuario lo solicite explícitamente.

Los commits serán realizados manualmente por los integrantes del equipo después de revisar los cambios.

- No crear múltiples commits pequeños por archivo; los commits deben representar unidades funcionales de trabajo.
- Utilizar Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Ejemplo: `feat: inicializar servidor Express`

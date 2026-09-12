# Beacon Frontend Web

Cliente web de [Beacon](https://github.com/gbaldessari/Beacon-App): una PWA para gestionar tareas, finanzas, notas y avisos.

API: [Beacon-Backend](https://github.com/gbaldessari/Beacon-Backend).

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Axios y Socket.IO client
- CSS propio (tema claro/oscuro)
- nginx (imagen Docker) / Vercel (SPA)

La app es instalable (manifest, iconos y Web Push) y está pensada para uso en el navegador y en móvil.

## Pantallas

| Ruta | Descripción |
| --- | --- |
| `/login` | Ingreso y registro público |
| `/home` | Inicio: atajos y pendientes del día |
| `/home/tasks` | Calendarios, recordatorios y recurrencia |
| `/home/finance` | Espacios, movimientos, presupuestos y metas (CLP) |
| `/home/notes` | Notas, checklists, etiquetas y archivo |
| `/home/profile` | Perfil; administración de usuarios si el rol es admin |
| `/invite/:kind/:token` | Aceptar invitación a calendario o espacio financiero |
| `/recover-password` / `/reset-password` | Recuperación de cuenta |

La sesión usa un access token en memoria y una cookie httpOnly de refresh. Las rutas autenticadas se protegen según el tipo de permiso (`ADMIN` o `USER`).

## Requisitos

- Node.js 20+
- API de Beacon corriendo (local o remota)

## Configuración

```bash
copy .env.example .env
npm install
npm run dev
```

En macOS/Linux usa `cp .env.example .env`.

Variable necesaria:

```
VITE_BACK_URL=http://localhost:3000
```

En producción apunta a la URL pública del backend (por ejemplo el servicio en Railway). Vite inyecta esa URL en el build: hay que reconstruir si cambia.

El cliente queda en [http://localhost:5173](http://localhost:5173). CORS y cookies dependen de que `FRONTEND_URL` en el backend coincida con ese origen.

## Scripts

```bash
npm run dev       # Vite (puerto 5173)
npm run build
npm run preview
npm run lint      # oxlint
```

## Docker

La imagen construye el frontend y lo sirve con nginx (SPA fallback a `index.html`):

```bash
docker build --build-arg VITE_BACK_URL=http://localhost:3000 -t beacon-frontend .
```

Para el stack completo (frontend + API + Postgres) usa el Compose de [Beacon-App](https://github.com/gbaldessari/Beacon-App).

## Despliegue

`vercel.json` reescribe todas las rutas a `index.html` para el enrutado del cliente. En Vercel define `VITE_BACK_URL` con la URL HTTPS del API.

## Licencia

[MIT](./LICENSE) © 2026 Giacomo Baldessari

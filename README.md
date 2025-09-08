## Formify – Technical Assignment (Senior 3D Web Developer)

### Quick start (Docker Compose)

.env is optional — docker-compose has sane defaults. Run:

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Postgres: `localhost:5432` (db `formify`, user `postgres`, password `postgres`)

### Demo

<video src="./demoVideo.mp4" controls style="max-width: 100%; height: auto;">
</video>

If inline playback is not available, download or view the file directly: [demoVideo.mp4](./demoVideo.mp4)

This repository implements a 3D product configurator focused on realistic wood materials, with state snapshot save/restore and a typed backend API. The work was completed in roughly 24+ hours.

### Highlights

- **Wood material configurator**: Real‑time, procedural wood appearance with configurable genuses/finishes and physically based lighting.
- **Snapshots (save/restore)**: Serialize the full configurator state, persist to the backend, and restore later to continue editing.
- **Modern 3D stack**: React + React Three Fiber + Three.js, optional WebGPU renderer fallback to WebGL.
- **Typed API + Postgres**: Express routes to create/list/load/update/delete saved states, validated and stored in PostgreSQL.

## Architecture

- **Monorepo** powered by Bun workspaces:
  - `services/frontend-react` – React + Vite + TypeScript + Zustand + R3F/Drei
  - `services/backend-express` – Express + TypeScript + `pg`
  - Orchestrated via `docker-compose.yml` for hot‑reload dev (frontend, backend, Postgres)

### Frontend (React, R3F, Three.js)

- Rendering surface in `ProductCanvas.tsx`:

  - Prefers WebGPU (`three/webgpu`) whenever available and secure; otherwise falls back to `THREE.WebGLRenderer`.
  - Uses physically correct lighting and consistent tone mapping per backend (WebGPU: Neutral; WebGL: ACES Filmic).
  - Ambient, hemisphere, and a shadow‑casting directional light with tuned map size/bias for clean soft shadows.
  - Uses `preserveDrawingBuffer` on the WebGL path to make snapshot capture reliable.

- Configurator store in `createNewConfiguratorModule.ts`:

  - A typed Zustand store models dimensions, frame/column/shelf thicknesses, material selection, and detailed wood parameters.
  - Geometry/layout helpers enforce valid spacing with forward/backward passes to clamp positions within the inner frame cavity.
  - Preset application merges mapped wood parameters for a given genus/finish.

- Snapshot helpers in `serialize.ts`:
  - `serializeModuleStore` emits a complete, versioned JSON snapshot of the module state.
  - `applySerializedState` restores the snapshot deterministically, re‑applying dimensions, elements, selection, material choice, and wood parameters.

### Backend (Express + Postgres)

- App bootstrap in `services/backend-express/src/index.ts` with CORS, JSON body parsing, and JSON error handling.
- Saved‑states routes are mounted under `/api/states` (`states.routes.ts`). Intended REST design:
  - `GET /api/states?limit&offset&query` → list summaries
  - `GET /api/states/:id` → fetch full saved state
  - `POST /api/states` → create new saved state (name, optional thumbnail, JSON snapshot)
  - `PUT /api/states/:id` → update name/thumbnail/state
  - `DELETE /api/states/:id` → remove
- Data model (table `configurator_states`): `id`, `name`, `thumbnail_data_url`, `state` (JSONB), timestamps, indexed by `created_at DESC`.

## Technical decisions

- **Renderer selection (WebGPU → WebGL)**: We detect capability and secure context to opt into WebGPU for better performance and temporal stability; the code bridges R3F’s render loop if `renderAsync` exists. WebGL is tuned for quality (tone mapping, exposure, soft shadows).
- **Physically based lighting**: Consistent tone mapping and IBL (`<Environment preset="studio"/>`) keep materials believable across backends.
- **Deterministic layout**: When size or thickness changes, we recompute column and shelf positions with clamped forward/backward passes to guarantee spacing invariants without overlaps.
- **Versioned serialization**: Snapshots include a `version` field to enable future migrations while keeping old saves compatible.
- **Strict TypeScript + ESLint**: Latest TS and ESLint ensure safe, legible code. In the UI we prefer `rem` over absolute `px` for scale consistency.

## API schema (snapshot shape)

The snapshot JSON aligns with the frontend store (see `serialize.ts`):

- **Root**: `{ version: '1', dimensions, columns, shelves, columnThickness, shelfThickness, frameThickness, materials, selectedMaterialKey, woodParams, selectedGenus, selectedFinish, hoveredId, selectedId }`

This structure is suitable for validation (e.g., with Zod) and storage in a `JSONB` column.

## Getting started

### Prerequisites

- Docker (Engine/Desktop) and Docker Compose
- Optional for local (non‑Docker) dev: Bun `1.x`

### 1) Clone

```bash
git clone <your-fork-or-repo-url> formify
cd formify
```

.env is optional (compose provides defaults via environment fallbacks). Create one only if you need overrides. If you do create a `.env`, typical keys: `API_PORT=3000`, `WEB_PORT=5173`, `VITE_API_URL=http://localhost:3000`, and `DATABASE_URL` for the backend.

### 2) Run with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Postgres: `localhost:5432` (db `formify`, user `postgres`, password `postgres`)

Hot‑reload is enabled via bind mounts; node_modules are volume‑mounted per service.

### 3) Run locally without Docker (optional)

```bash
# install dependencies once at the repo root
bun install

# frontend (shell 1)
cd services/frontend-react && bun run dev

# backend (shell 2)
cd services/backend-express && bun run dev
```

For local without Docker you must provide a running Postgres and set `DATABASE_URL` for the backend.

## Repository layout

```
services/
  frontend-react/
    src/scenes/ProductCanvas.tsx
    src/scenes/createNewConfiguratorModule.ts
    src/scenes/serialize.ts
  backend-express/
    src/index.ts
    src/routes/states.routes.ts
docker-compose.yml
```

## Development notes

- **TypeScript**: strict configuration; prefer explicit types on public APIs.
- **Linting**: latest ESLint rules; keep changes clean and legible.
- **Styling**: use `rem` for spacing/typography where applicable.

## Attribution

- Time spent: ~24+ hours.

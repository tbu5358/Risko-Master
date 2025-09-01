## RISKO_MASTER Developer Handbook

This handbook provides a comprehensive overview of the RISKO_MASTER monorepo: structure, stacks, setup, environment, apps/services, Supabase backend, development workflows, and troubleshooting. It is intended for new developers to get productive quickly.

### 1. Monorepo Overview

- **Repo name**: `RISKO_MASTER`
- **Manager**: Node/NPM per app, with top-level convenience scripts using `concurrently`.
- **Top-level scripts** (from `package.json`):
  - `dev:browser`: run the landing UI app at `apps/browser`
  - `dev:speedchess:game`: run the SpeedChess React app
  - `dev:snake:game`: run the SnakeRoyale React app
  - `dev:surio:game`: run the Suroi client (Svelte + Pixi)
  - `dev:speedchess:service`: run SpeedChess backend (Express + WS)
  - `dev:snakeroyale:service`: run SnakeRoyale backend (Express)
  - `dev:snakeroyale:realtime`: run SnakeRoyale realtime WS server
  - `dev:surio:service`: run Suroi server (uWebSockets)
  - `dev:services`: run all services together
  - `dev:games`: run UI apps together
  - `dev:all`: run everything (games + services)

### 2. Directory Structure

```
RISKO_MASTER/
  package.json                 # Top-level helper scripts
  .gitignore                   # Monorepo ignores (node_modules, build artifacts, env, etc.)
  apps/
    browser/                   # Landing/portal app (React + Vite + shadcn/ui + Tailwind)
    snakeroyale/
      snake-royale-game/       # SnakeRoyale client (React + Vite)
      snake-royale-service/    # SnakeRoyale backend (Express + WebSocket)
    speedchess/
      speed-chess-game/        # SpeedChess client (React + Vite + chessboard)
      speed-chess-service/     # SpeedChess backend (Express + WebSocket)
    surio/
      surio-service/           # Suroi authoritative server (TypeScript + uWebSockets.js)
      suroi-game/
        client/                # Suroi browser client (Svelte + Vite + Pixi)
        common/                # Shared game types/definitions
  supabase/
    config.toml                # Local supabase project id
    deno.json                  # Deno tasks and config (functions serve)
    import_map.json            # Deno import map
    functions/                 # Edge functions (Deno)
    migrations/                # SQL migrations ordered by timestamp
```

### 3. Tech Stack Summary

- **Frontend**:
  - React 18 + Vite 5, TypeScript, Tailwind, shadcn/ui, Radix UI
  - Suroi client: Svelte 5 + Vite 6, Pixi.js for rendering
  - State: `zustand` (browser), `@tanstack/react-query` (browser)

- **Backend Services**:
  - Express + WebSocket (`ws`) for SpeedChess and SnakeRoyale
  - Suroi server: Node + TypeScript, `uWebSockets.js` for high-perf networking

- **Supabase**:
  - Postgres, Row-Level Security (RLS)
  - Edge Functions (Deno) under `supabase/functions`
  - Migrations for schema, views, security hardening

### 4. Environment Variables

Create per-app `.env` files (never commit). Common keys:

- Frontend (Vite):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

- Services (Node):
  - `NODE_ENV` (development|production)
  - `PORT` (service HTTP port)
  - `RT_PORT` (SnakeRoyale realtime port)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - Optional CORS allowlist domains

- Supabase CLI (local dev only): handled by `supabase/config.toml` and CLI auth; no extra envs committed.

### 5. Apps and Services

#### 5.1 apps/browser (Portal UI)

- Stack: React + Vite + TypeScript + Tailwind + shadcn/ui + Radix
- Supabase client: `src/integrations/supabase/client.ts` uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Start:
  - `npm run dev:browser` (from repo root)
  - or `cd apps/browser && npm install && npm run dev`

Structure highlights:
- `src/components/` shadcn/ui library wrappers and app components
- `src/pages/` route-level screens (Dashboard, Leaderboard, Game, Profile, etc.)
- `src/hooks/` utilities like `useGameActions`, `useTheme`, `use-toast`
- `src/services/supabaseService.ts` higher-level data access

#### 5.2 apps/speedchess/speed-chess-game (SpeedChess UI)

- Stack: React + Vite, chess components (`react-chessboard`, `chess.js`)
- Start: `npm run dev:speedchess:game` or run inside the folder

#### 5.3 apps/speedchess/speed-chess-service (SpeedChess Backend)

- Stack: Express + WebSocket, TypeScript
- Entry: `src/server.ts`
- Supabase service client: `src/supabaseClient.ts` reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Endpoints (HTTP):
  - `POST /api/create-match`
  - `POST /api/join-match`
  - `POST /api/cancel-match`
  - `POST /api/complete-match`
  - `GET  /api/leaderboard`
  - `GET  /api/profile?username=...` (aggregates game stats)
  - `POST /api/deposit`, `POST /api/withdraw`, `POST /api/balance`
  - `POST /api/internal-credit`, `POST /api/internal-debit`
  - `POST /api/deposit-webhook`, `POST /api/withdraw-webhook`
- WebSocket server lives on the same port, used for match relays.
- Start: `npm run dev:speedchess:service` or inside folder `npm run dev`

#### 5.4 apps/snakeroyale/snake-royale-game (SnakeRoyale UI)

- Stack: React + Vite
- Start: `npm run dev:snake:game` or `npm run dev` inside

#### 5.5 apps/snakeroyale/snake-royale-service (SnakeRoyale Backend + Realtime)

- Stack: Express for REST; separate realtime WS server in `src/realtime/index.ts`
- Service (HTTP) Endpoints:
  - `POST /api/create-match`
  - `POST /api/join-match`
  - `POST /api/cancel-match`
  - `POST /api/complete-match`
  - `GET  /api/leaderboard`
  - `GET  /api/get-active-matches`
  - `POST /api/deposit`, `POST /api/withdraw`, `POST /api/balance`
  - `POST /api/internal-credit`, `POST /api/internal-debit`
  - `POST /api/deposit-webhook`, `POST /api/withdraw-webhook`
- Realtime WS server:
  - Auth bootstrap via Supabase `auth.getUser(token)` if token provided
  - Messages include: CONNECT, JOIN_MATCH, MATCH_CANCEL, PLAYER_MOVE/BOOST/EMOJI, LEADERBOARD_REQUEST, PROFILE_REQUEST
  - Env: `RT_PORT` (defaults 8083)
- Start:
  - HTTP: `npm run dev:snakeroyale:service`
  - Realtime: `npm run dev:snakeroyale:realtime`

#### 5.6 apps/surio/suroi-game (Client + Common)

- `client/`: Svelte 5 + Vite 6 + Pixi.js, rich asset pipeline, SCSS.
- `common/`: shared TypeScript definitions and game constants.
- Start client: `npm run dev:surio:game` or inside `client` run `npm run dev`.

#### 5.7 apps/surio/surio-service (Suroi Server)

- TypeScript server using `uWebSockets.js` for high-performance networking.
- Scripts:
  - `npm run dev` (nodemon + ts-node)
  - `npm run build` (tsc + tsc-alias)
  - `npm start` (runs built output)
- Watches `../common` for shared definitions; includes a config schema (`config.schema.json`) and an example config (`config.example.json`).

### 6. Supabase Backend

- Location: `supabase/`
- Local dev:
  - Install Supabase CLI
  - `cd supabase && deno task dev` to serve functions locally (`deno.json` -> `supabase functions serve`)
- Functions:
  - Shared utils: `functions/_shared/{auth.ts,cors.ts}`
  - Game functions: `speedchess-*` create/join/cancel/complete/leaderboard
  - User/profile: `user-by-username-get`, `user-profile-get`, `wallet-balance-get`, `recent-game-results`
  - Transactions: `transactions-*` (deposit/withdraw/internal credit/debit + webhooks)
- Migrations:
  - Ordered SQL files defining enums, identity, transaction tables, game tables (speedchess, royale), views, RLS, triggers, and hardening.
  - Apply with Supabase CLI or CI.

### 7. Development Setup

1) Prereqs:
   - Node 18+ (recommend 20+)
   - pnpm/npm (project uses npm per app; pnpm used in Suroi workspace as well)
   - Deno + Supabase CLI for functions/migrations

2) Install:
   - Each app maintains its own `node_modules`. Run `npm install` in the app you will work on.
   - Example: `cd apps/browser && npm install`

3) Env files:
   - Create `.env` in each service and `.env.local` or `.env` in each Vite app using variables from Section 4.

4) Run:
   - All games: `npm run dev:games`
   - All services: `npm run dev:services`
   - Everything: `npm run dev:all`

### 8. Common Workflows

- Lint/Format:
  - Frontends: `npm run lint` inside each app (ESLint 9 + TypeScript)
  - Services: `npm run lint` and `npm run lint:fix` where available; `prettier` commands present in services

- Build:
  - Vite apps: `npm run build`
  - Services: `npm run build` (tsc), then `npm start`

- Tests:
  - SpeedChess service: Jest configured (`npm test`)

- Supabase:
  - Run functions locally: `cd supabase && deno task dev`
  - Apply SQL migrations with Supabase CLI or CI pipeline

### 9. Architecture Notes

- Frontend apps consume Supabase directly (browser anon key) and service HTTP/WS endpoints for game sessions.
- Services use Supabase Service Role key for privileged actions (keep server-side only).
- Suroi uses a dedicated high-performance server with shared common definitions for exact client/server parity.

### 10. Ports & URLs (Dev Defaults)

- Browser, SpeedChess, SnakeRoyale UIs: Vite defaults (5173..5176 as configured in CORS)
- SpeedChess service: `PORT=8081`
- SnakeRoyale service: `PORT=8082`
- SnakeRoyale realtime: `RT_PORT=8083`

### 11. Troubleshooting

- Missing Supabase envs:
  - Frontend error: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY" → add to `.env`
  - Services throw on startup if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing

- CORS in services:
  - Update allowed origins in `src/server.ts` for production domains

- Port conflicts:
  - Adjust `PORT`/`RT_PORT` envs per service

- Large asset changes:
  - Be mindful of repo size; prefer CDN/storage for very large binary assets

### 12. Security & Secrets

- Never commit `.env` files or service role keys
- Keep PATs/tokens out of remote URLs in git config (use one-off URLs if needed)
- Verify RLS policies are active in Supabase when enabling production access

### 13. Contribution Guide

- Branching: `feat/*`, `fix/*`, `chore/*`
- Commits: Conventional style preferred (e.g., `feat(browser): add leaderboard filters`)
- PRs: Include screenshots for UI changes and test notes for services

### 14. Quickstarts

- Browser app:
  1. `cd apps/browser && npm install`
  2. Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  3. `npm run dev`

- SpeedChess service:
  1. `cd apps/speedchess/speed-chess-service && npm install`
  2. Create `.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional `PORT`
  3. `npm run dev`

- SnakeRoyale service + realtime:
  1. `cd apps/snakeroyale/snake-royale-service && npm install`
  2. Create `.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `RT_PORT`
  3. `npm run dev` (HTTP) and in parallel `npm run dev:ws` if provided, or `npm --prefix . run dev:ws`

- Suroi:
  - Client: `cd apps/surio/suroi-game/client && npm install && npm run dev`
  - Server: `cd apps/surio/surio-service && npm install && npm run dev`

---

For updates, keep this handbook in sync with `package.json` scripts and Supabase migrations.

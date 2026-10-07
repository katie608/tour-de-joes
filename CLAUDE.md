# Tour de Joes — Claude Context

A mobile-first Trader Joe's scavenger hunt web app. One-day event, run annually. See [README.md](./README.md) for full setup and deployment docs.

## Infrastructure

- **Server:** AWS EC2 Ubuntu instance at `tourdejoes.com` (IP changes if instance is stopped/started — check EC2 console)
- **SSH:** `ssh -i ~/.ssh/tour-de-joes.pem ubuntu@<ip>` (key may be at `~/Downloads/tour-de-joes-key.pem`)
- **Process manager:** PM2 — app runs as `tour-de-joes`, starts on boot
- **Web server:** nginx reverse proxy with HTTPS (certbot, auto-renews via systemd timer)
- **Database:** PostgreSQL on the EC2 instance (`postgresql://scavenger:scavenger@localhost:5432/scavenger`)
- **File storage:** AWS S3 (bucket name in `server/.env` as `S3_BUCKET`)
- **DB connection from server:** `psql "postgresql://scavenger:scavenger@localhost:5432/scavenger"`

## Stack

- **Backend:** Node/Express/TypeScript, Prisma ORM, PostgreSQL — in `server/`
- **Frontend:** React/Vite/TypeScript, react-router, mobile-first CSS — in `client/`
- **Monorepo:** npm workspaces (root `package.json`)
- **Auth:** session token (Bearer header), `requireAuth` + `requireAdmin` middleware
- **Game state:** single-row `GameSetting` table (`state`: `pending` | `active` | `ended`) — controls whether actions are locked

## Admin account

- Username: `admin`, Password: `changeme` — **change this before the game**
- Set in `server/.env` as `ADMIN_USERNAME` / `ADMIN_PASSWORD`

## Deploy after changes

```sh
git push && ssh -i ~/.ssh/tour-de-joes.pem ubuntu@<ip> \
  "cd ~/tour-de-joes && git pull && cd server && npm run build && cd ../client && npm run build && pm2 restart tour-de-joes"
```

Note: there is no root-level `build` script — server and client must be built separately.

- Add `npx prisma migrate deploy && npx prisma generate` before the build if there are new Prisma migrations
- Frontend rebuild: `cd client && npm run build` (nginx serves `client/dist/`)

## Key files

- `server/src/routes/` — all API routes
- `server/src/lib/storeStatus.ts` — store control/points logic
- `server/src/lib/gameState.ts` — game start/end/pending state
- `server/src/middleware/auth.ts` — auth middleware
- `server/prisma/schema.prisma` — DB schema
- `client/src/pages/` — all page components
- `client/src/types.ts` — shared TypeScript types
- `client/src/api.ts` — `apiFetch` helper (adds Bearer token)
- `/etc/nginx/sites-available/tourdejoes` — nginx config on server

## Known limitations / TODO for next year

See `TODO.md` for the full list. Highlights:
- Store list still uses the original stores (not the updated 21-store list with addresses)
- First check-in bonus mechanic not implemented
- Fizz Mile challenge point value should be increased
- SMS alerts (AWS SNS) never got production access — phone field removed from UI
- Admin password should be changed before each game

# tour-de-joes

Trader Joe's Scavenger Hunt — a mobile-first web app for a one-day scavenger hunt. See [spec.md](./spec.md) for the full product spec.

## Stack

- **Backend** (`/server`): Node + Express + TypeScript, Prisma + PostgreSQL, session-token auth, local-disk file storage (under `server/uploads/`) behind a `storage.ts` abstraction that mirrors the S3 folder layout described in the spec (`{challenge}/{teamname}_{timestamp}.{ext}`) — swap in the S3 SDK there to go to production.
- **Frontend** (`/client`): React + Vite + TypeScript, react-router, mobile-first CSS, 30s polling on live pages.

## Local development setup

1. **Start Postgres** (requires Docker):
   ```sh
   docker compose up -d
   ```

2. **Configure environment**:
   ```sh
   cp server/.env.example server/.env
   ```
   Adjust `ADMIN_USERNAME` / `ADMIN_PASSWORD` as desired — this is the hardcoded admin account.

3. **Install dependencies** (from repo root):
   ```sh
   npm install
   ```

4. **Run migrations and seed data**:
   ```sh
   cd server
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the apps** (two terminals):
   ```sh
   # Terminal 1
   cd server && npm run dev

   # Terminal 2
   cd client && npm run dev
   ```

   The client dev server (default `http://localhost:5173`) proxies `/api` and `/uploads` to the backend on port 4000.

6. Open the app, register a team, and log in. Admin panel is reachable via the "Admin" tab on the login page using the credentials from `server/.env`.

## Production deployment (tourdejoes.com)

The app runs on an AWS EC2 instance (Ubuntu) at `34.232.26.167`, served by nginx with HTTPS via certbot.

### SSH into the server

```sh
ssh -i ~/Downloads/tour-de-joes-key.pem ubuntu@34.232.26.167
```

(Adjust the path to your `.pem` key file as needed.)

### Deploy changes

After pushing to `main`, SSH in and run:

```sh
cd ~/tour-de-joes && git pull && cd server && npm run build && pm2 restart tour-de-joes && cd ../client && npm run build
```

- Backend-only change (no new npm packages): you can skip `npm run build` and just `pm2 restart tour-de-joes` after `git pull` if running in dev mode — but a full build is always safe.
- Frontend-only change: only the `cd client && npm run build` part is strictly needed.
- New npm packages added: run `npm install` from `~/tour-de-joes` before the build.

### Useful server commands

```sh
pm2 logs tour-de-joes --lines 50   # view recent logs
pm2 status                          # check process status
sudo systemctl reload nginx         # reload nginx config without downtime
sudo nginx -t                       # test nginx config before reloading
```

## Notes

- No Postgres/Docker was available in the dev sandbox used to build this, so the schema/build were verified via `prisma generate` + TypeScript compilation only. Run the steps above locally to exercise the full app end-to-end.

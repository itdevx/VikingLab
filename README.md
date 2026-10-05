# ⚔️ Viking Lab

**Educational web & network penetration testing platform** by [itdevx](https://github.com/itdevx)

Intentionally vulnerable labs + a hardened training UI (clans, wars, academy, reports).

> **Warning:** Only use on this lab or systems you own / have written permission to test.

---

## Features

- **100+ challenges** across OWASP Top 10, tools practice, arena chains, and **clan war (WAR)** missions
- **Realistic labs:** Shop, Trade, Blog, WarOps, Network recon
- **Clans:** create/join (leader approval), trophies, leaderboard
- **Clan wars:** attacker vs defender — score only from WAR challenges (30 min – 2 h)
- **Academy:** Persian explanations + tooling guidance
- **Hints:** optional, cost points when unlocked
- **Reports:** bug-bounty style submissions
- **Dark Viking UI**, mobile-friendly
- **JSON persistence** by default (atomic writes under `data/`)
- **Optional MongoDB** via `MONGODB_URI` (install `mongoose`)

---

## Requirements

- Node.js **18+**
- npm

---

## Quick start

```bash
git clone https://github.com/itdevx/Viking-Lab.git
cd Viking-Lab
npm install
npm start
```

Open: **http://localhost:3000**

Register at `/auth/register` (no default passwords are shown in the UI for hosting safety).

### Optional demo seed users

If you need local demo accounts after first run, they are created in seed as:

| Email | Password | Role |
|-------|----------|------|
| `hunter@vikinglab.lab` | `hunter123` | hunter |
| `admin@vikinglab.lab` | `admin123` | admin |

Remove or change these before public deployment.

### Reset data

```bash
rm -rf data/
npm start
```

### Force re-seed challenges

```bash
FORCE_SEED=1 npm start
```

---

## Environment

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default `3000`) |
| `SESSION_SECRET` | Strong secret for sessions (**required on production**) |
| `MONGODB_URI` | Optional MongoDB connection string |
| `FORCE_SEED` | `1` to re-seed challenges |
| `NODE_ENV` | `production` hides internal error details |

Example:

```bash
export PORT=3000
export SESSION_SECRET="change-me-to-a-long-random-string"
export NODE_ENV=production
npm start
```

### MongoDB (optional)

```bash
npm install mongoose
export MONGODB_URI="mongodb://127.0.0.1:27017/vikinglab"
npm start
```

If MongoDB is unavailable, Viking Lab automatically uses the **JSON file store** in `data/db.json`.

---

## Project structure

```
Viking-Lab/
├── app/
│   ├── server.js              # Platform entry
│   ├── models/
│   │   ├── store.js           # JSON DB (users, challenges, clans, wars…)
│   │   ├── seed.js            # Challenge + flag definitions
│   │   └── mongo.js           # Optional Mongo connect
│   ├── routes/
│   │   ├── auth.js
│   │   ├── challenges.js      # Flag submit + paid hints
│   │   ├── clans.js           # Clans, requests, wars
│   │   ├── vulnerable.js      # /lab/* intentional vulns ONLY
│   │   └── ...
│   ├── views/                 # EJS UI
│   └── public/css/viking.css
├── data/                      # Runtime DB (gitignored)
├── package.json
└── README.md
```

---

## Labs

| Path | App |
|------|-----|
| `/lab/shop` | E-commerce vulns |
| `/lab/trade` | JWT, race, MFA |
| `/lab/blog` | IDOR, GraphQL, OAuth |
| `/lab/war` | Clan war challenges only |
| `/lab/network` | Ports, DNS, internal panel |
| `/lab/tools/burp` | Burp practice |

---

## Clan wars

1. Create/join a clan (join requests need **leader approval**).
2. Leader declares war (30 minutes – 2 hours).
3. Members solve **WAR** challenges on `/lab/war`.
4. Higher score wins **+50 clan trophies**.

Notifications for join requests and wars update in near real-time (polling every few seconds).

---

## Security model

| Area | Status |
|------|--------|
| `/auth`, `/dashboard`, `/clans`, `/reports` | Hardened training platform |
| `/lab/*` | **Intentionally vulnerable** |

Do not expose an open instance to the internet without authentication / network restrictions.

---

## Scripts

```bash
npm start          # run server
npm run dev        # nodemon (if installed)
FORCE_SEED=1 npm start
```

---

## License

MIT — educational use only.

Unauthorized testing is illegal.

---

## Author

**itdevx** — [github.com/itdevx](https://github.com/itdevx)

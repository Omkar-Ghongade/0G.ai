# 0G Social

Social feed on 0G: posts (text + optional image) stored on 0G via a backend (zgDrive-style).

## Run

**Frontend**

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Backend (required for creating posts)**

```bash
cd backend
cp .env.example .env
# Set PRIVATE_KEY in .env (wallet with 0G testnet balance)
npm install
npm run dev
```

See [backend/README.md](backend/README.md) for details.

**Smart contract (optional, from plan.md)**

- Deploy [contracts/0GSocial.sol](contracts/0GSocial.sol) (ZeroGSocial) to 0G Galileo testnet (chainId 16602). See [contracts/README.md](contracts/README.md).
- In the app root create `.env` and set `VITE_CONTRACT_ADDRESS=0xYourDeployedAddress`, then restart the frontend.
- When set: create post → backend uploads to 0G → frontend calls `createPost(contentId, caption)`; likes call `like`/`unlike` on-chain.

## Features (MVP)

- **Feed** — Chronological posts (mock data + new posts from chain when contract is set)
- **Create post** — Backend uploads to 0G; if contract address is set, frontend calls `createPost(contentId, caption)` on-chain
- **Like / unlike** — On-chain when contract is set; otherwise local state
- **Single post** — `/post/:id`; **Connect wallet** — MetaMask

## Stack

- Vite + React
- Tailwind CSS (neobrutal theme)
- React Router (`/`, `/post/:id`)

## UI

Neobrutalism: thick black borders, hard offset shadows, flat saturated colors (cream bg, yellow primary, orange accent, pink like). Space Grotesk font.

## Backend API

- **GET /api/content/:contentId** — Resolve 0G content by root hash (returns JSON: `body`, `imageRootHash`). Use when loading feed from chain.

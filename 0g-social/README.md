# 0G Social — Frontend

Social feed on 0G: posts (text + optional image), feed, likes. This is the **Phase 1 frontend** with mock data; Phase 2 will wire to the smart contract and 0G storage.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features (MVP)

- **Feed** — Chronological posts (mock data), newest first
- **Create post** — "New post" opens modal: body (required), optional image; posts prepend to feed (local state only)
- **Like / unlike** — Toggle per post; count updates locally
- **Single post** — `/post/:id` shows full post; "View" link from feed
- **Connect wallet** — Button opens "Coming soon" modal (Phase 2)

## Stack

- Vite + React
- Tailwind CSS (neobrutal theme)
- React Router (`/`, `/post/:id`)

## UI

Neobrutalism: thick black borders, hard offset shadows, flat saturated colors (cream bg, yellow primary, orange accent, pink like). Space Grotesk font.

## Phase 2

Wire to 0G contract (posts + likes) and 0G storage (content by CID); replace mock state with chain + storage.

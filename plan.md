# 0G Social — 4-Hour Build Plan

Social media on 0G: **posts** (text + optional photo), **feed**, **likes**. Content in 0G storage, pointers + social actions on 0G chain.

**Order: build frontend first (with mocks), then smart contract + 0G storage.**

---

## Scope (MVP)

| Feature            | In scope |
|--------------------|----------|
| Create post        | ✅ Text + optional image (image → 0G storage, CID on-chain) |
| Global feed        | ✅ Chronological, load content from storage by CID |
| Like / unlike      | ✅ On-chain |
| View single post   | ✅ |
| Wallet connect     | ✅ (e.g. MetaMask / 0G-compatible) |

| Deferred           | Out of scope for 4 hrs |
|--------------------|-------------------------|
| Comments           | v2 |
| Follows / profiles | v2 |
| Notifications      | v2 |

---

## Stack

- **Frontend:** Next.js or Vite + React, Tailwind; mock data first, then wallet + contract.
- **Later:** 0G (EVM) contract (posts + likes), 0G storage (content by CID).

---

## UI style — Neobrutalism

Use a **neobrutalism** aesthetic across the app: bold, raw, high-contrast, chunky.

### Visual rules

- **Borders:** Thick (2–4px), solid, usually black. Use on cards, buttons, inputs, header.
- **Colors:** Flat, saturated. No gradients unless very simple. Examples:
  - Background: off-white (`#FAF9F6`), cream (`#FFF8E7`), or light yellow.
  - Primary actions: bright yellow (`#F7E733`), orange (`#FF6B35`), or green (`#00D26A`).
  - Secondary / outline: black (`#000`) for borders and text.
  - Accent: one strong color for “like” or links (e.g. red/pink for like).
- **Shadows:** Prefer **hard / offset** box-shadows (e.g. `4px 4px 0 0 #000`) instead of soft blurs. Gives a “stamped” or “cut-out” look.
- **Typography:** Bold, sans-serif (e.g. **Space Grotesk**, **Archivo Black**, **Bebas Neue**, or system font with `font-weight: 700/800`). Large headings, clear hierarchy.
- **Buttons:** Solid fill + thick black border + hard shadow on hover (e.g. shadow shifts to `2px 2px 0 0 #000` for “pressed”).
- **Cards (posts):** White or tinted background, 3–4px black border, hard shadow (e.g. `6px 6px 0 0 #000`). Slightly rounded corners (e.g. `0.5rem`) optional.
- **Inputs:** Same as buttons — thick border, flat fill, no inner shadow. Focus: darker border or outline.

### Tailwind-oriented tokens (extend `tailwind.config)

```js
// Example theme extension
colors: {
  brutal: {
    bg: '#FAF9F6',
    surface: '#FFFFFF',
    border: '#000000',
    primary: '#F7E733',
    accent: '#FF6B35',
    like: '#FF3B5C',
  }
}
// Border width: border-2 or border-4
// Shadow: shadow-[4px_4px_0_0_#000] or shadow-[6px_6px_0_0_#000]
```

### Apply to

- **Header:** Thick bottom border, bold “0G Social” title, primary-colored “New post” and “Connect wallet” buttons with hard shadow.
- **Post cards:** White/surface bg, black border, hard shadow; bold caption, clear author and timestamp.
- **Create post form:** Inputs and “Post” button in same neobrutal style.
- **Like button:** Distinct color (e.g. red/pink) when liked; outline + fill when not.
- **Single post page:** Same card treatment, larger type for body.

**Deliverable:** Entire UI feels consistent: chunky, bold, high-contrast neobrutalism.

---

# Phase 1 — Frontend first (~2–2.5 hrs)

Build the full UI and flows with **mock data** and **local state** (or a tiny in-memory “API”). No wallet, no chain, no storage. Then you plug in the real backend.

---

### Block 1 — App shell + layout (~25 min)

- Create app: `npm create vite@latest 0g-social -- --template react` (or Next.js), add Tailwind.
- **Layout:** Header (logo/title “0G Social”, placeholder “Connect wallet”, “New post” button). Main area for feed. Footer optional.
- **Style:** Apply neobrutalism from the start — thick black borders, hard shadows, bold type, flat saturated colors (see **UI style — Neobrutalism**).
- **Routing:** Home = feed (`/`). Single post = `/post/:id`. Use React Router (Vite) or App Router (Next).
- **Placeholder feed:** Empty state “No posts yet” or a single hardcoded post card so you see the layout.

**Deliverable:** App runs, layout and routes exist, one mock post visible in neobrutal style.

---

### Block 2 — Data shape + mock feed (~25 min)

- Define **post shape** to match the future contract + storage:
  - `postId`, `author` (address string), `contentId` (string), `caption`, `createdAt` (timestamp).
  - Resolved content: `body`, `imageUrl` (or `imageCid` — for now use a placeholder image URL or local blob).
- **Mock posts:** 3–5 items in a `mockPosts` array (or `posts.json`). Include mix of text-only and text + image.
- **Feed component:** Map over mock posts. Each card shows: author (short address), caption, body snippet (e.g. first 100 chars), image if present, timestamp, like count, “Like” button. Newest first.
- Keep mock data in state (e.g. `useState(mockPosts)`) so you can add “like” toggles in the next block.

**Deliverable:** Feed renders from mock data; cards look right.

---

### Block 3 — Create post form + local “create” (~30 min)

- **Create post modal or page:** Text area (body), optional file input (image), optional short caption. “Post” button.
- On submit (no wallet yet):
  - Build post object: `author: "0xMock...", contentId: "mock-cid-...", caption, createdAt: Date.now(), body, imageUrl` (for image use `URL.createObjectURL(file)` or a placeholder).
  - **Prepend** to feed state (so new post appears at top). No backend — pure local state.
- Show validation (e.g. body required). Optional: “Uploading…” / “Posting…” loading state to mimic future flow.

**Deliverable:** User can “create” a post and see it in the feed immediately (mock only).

---

### Block 4 — Likes + single post view (~30 min)

- **Likes:** In mock state, store `likeCount` and `likedByUser` per post (or a `likes: Set<address>`). “Like” button toggles local state and updates count. No contract yet.
- **Single post page:** Route `/post/:id`. Find post by id in mock state. Show full body, image, author, caption, time, like count, like button. Link from feed card (e.g. “View” or click caption) to `/post/:id`.
- **Empty / missing:** If id not found, show “Post not found”.

**Deliverable:** Likes work in UI; single post view works with mock data.

---

### Block 5 — Polish (~20 min)

- **Neobrutalism pass:** Buttons, inputs, cards, header all use thick borders, hard shadows, bold type; no soft shadows or gradients.
- Loading states: “Loading feed…” (can be a 0.5s mock delay once), “Posting…” on create.
- Error states: “Something went wrong” if “create” fails (e.g. validation).
- Responsive: feed and cards readable on mobile; header doesn’t break.
- “Connect wallet” in header can be a disabled button or a modal saying “Coming soon — connect in Phase 2”.

**Deliverable:** Frontend MVP complete with mocks, full neobrutal look; ready to wire to contract + storage.

---

# Phase 2 — Smart contract + 0G storage (after frontend)

Once the UI is done, add the real backend.

---

### Block 6 — Smart contract

- `struct Post { address author; string contentId; string caption; uint256 createdAt; }`
- `mapping(uint256 => Post) public posts;` + `uint256 public postCount;`
- `function createPost(string calldata contentId, string calldata caption) external`
- `mapping(uint256 => mapping(address => bool)) public likes;` + `mapping(uint256 => uint256) public likeCount;`
- `function like(uint256 postId)` / `function unlike(uint256 postId)`
- Compile, deploy to 0G testnet. Save address + ABI.

---

### Block 7 — 0G storage

- Confirm 0G storage upload flow (docs/SDK). Per post: upload image (if any) → get `imageCid`; upload JSON `{ body, imageCid?, createdAt }` → get **contentId**.
- In the app: “Create post” → upload to 0G storage → get `contentId` → call `createPost(contentId, caption)`.

---

### Block 8 — Wire frontend to chain + storage

- Wallet connect (ethers + 0G chain, or wagmi). Replace “Connect wallet” with real connect/disconnect.
- **Feed:** Read `postCount` and `posts(id)` from contract; for each post fetch content from 0G storage by `contentId`; replace mock state with this data.
- **Create post:** Use real upload + `createPost(...)`; on success, refetch feed or add to state.
- **Likes:** Call `like` / `unlike`; refetch like count and “liked by current user” from contract.
- **Single post:** Same as feed but for one `postId`; load content from storage by `contentId`.
- Error handling: wrong network, tx failed, “Connect wallet” when not connected.

---

## Contract Interface (reference)

```solidity
struct Post {
    address author;
    string  contentId;  // 0G storage ref (CID/key)
    string  caption;
    uint256 createdAt;
}

mapping(uint256 => Post) public posts;
uint256 public postCount;

mapping(uint256 => mapping(address => bool)) public likes;
mapping(uint256 => uint256) public likeCount;

function createPost(string calldata contentId, string calldata caption) external;
function like(uint256 postId) external;
function unlike(uint256 postId) external;
```

---

## 0G Storage Content Shape (suggestion)

Per post, one object in 0G storage (referenced by `contentId`):

```json
{
  "body": "Full post text...",
  "imageCid": "optional-0g-storage-cid-for-photo",
  "createdAt": 1234567890
}
```

- Upload image first → get `imageCid`; then upload this JSON → get `contentId`; pass `contentId` + short `caption` to `createPost`.

---

## Phase 1 checklist (frontend)

- [ ] Node.js + npm (or pnpm) installed
- [ ] Pick: Vite + React or Next.js
- [ ] Tailwind added to the project

## Phase 2 checklist (contract + storage)

- [ ] 0G testnet RPC URL and chain id
- [ ] Wallet with testnet funds (for gas)
- [ ] 0G storage API/SDK docs and upload flow (how to get CID)
- [ ] Contract deploy path (Remix, Hardhat, or Foundry)

---

## If You Get Ahead

- Add **comments** (contract: `mapping(postId => Comment[])`, `createComment(postId, contentId)`; same storage pattern).
- Add **follow** list and “following feed” (filter posts by followed addresses).

You’ve got 4 hours — ship the feed, then likes, then single post; everything else is v2.

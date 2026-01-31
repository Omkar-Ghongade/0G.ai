# 0g-social backend

Storage like [zgDrive](https://github.com/udhaykumarbala/zgDrive): the server receives the post (body + optional image), uploads to 0G with a **server wallet** (private key in env), and returns the content ID. Users don’t need to connect a wallet to post.

## Setup

1. Copy env and set your wallet (needs testnet balance for gas):

   ```bash
   cp .env.example .env
   # Edit .env and set PRIVATE_KEY=
   ```

2. **Fund the wallet with 0G testnet tokens** (required – uploads send storage fee + gas in 0G):
   - Add network in MetaMask: **0G Galileo Testnet**, chainId **16602**, RPC `https://evmrpc-testnet.0g.ai`
   - Get 0G from **[https://faucet.0g.ai](https://faucet.0g.ai)** (0.1 0G/day per wallet)
   - Use the **same address** as your `PRIVATE_KEY`. If balance is 0, the flow contract will revert with `execution reverted`.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Server runs at **http://localhost:8080**. Frontend uses `VITE_API_URL=http://localhost:8080` (default) or set it in `.env` in the frontend root.

## API

- **GET /health** — `OK`
- **GET /diagnostics** — Flow contract state: `paused`, `chainId`, `flowAddress`, `marketAddr`. Use when upload reverts (e.g. if `paused` is true, storage is disabled).
- **POST /api/post** — Create post (multipart: `body` text, optional `image` file). Returns `{ contentId, imageRootHash?, txHash }`. Server uploads to 0G and pays gas.

## If upload reverts with "execution reverted"

1. **Check diagnostics:** `curl http://localhost:8080/diagnostics` — if `paused` is `true`, storage is disabled on testnet.
2. **Try another RPC:** In `.env` set `EVM_RPC=https://rpc.ankr.com/0g_galileo_testnet_evm` (or another [0G Galileo RPC](https://docs.0g.ai/developer-hub/testnet/testnet-overview)), restart, then try again.

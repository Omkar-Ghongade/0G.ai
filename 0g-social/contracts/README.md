# 0G Social contract (from plan.md)

**ZeroGSocial** — posts (contentId + caption on-chain). Image is uploaded to 0G with the post; only contentId is stored (content JSON has body + imageRootHash).

## Deploy to 0G testnet (Galileo, chainId 16602)

1. **Remix:** Go to [remix.ethereum.org](https://remix.ethereum.org). Create `contracts/ZeroGSocial.sol` (copy from `0GSocial.sol`; the contract name inside the file is `ZeroGSocial`). Compile with Solidity 0.8.19+. In Deploy, choose "Injected Provider", switch to 0G Galileo (chainId 16602, RPC `https://evmrpc-testnet.0g.ai`). Deploy. Copy the contract address.

2. **Frontend:** In the app root create `.env` and set:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
   ```
   Restart the dev server. Create post will then call `createPost(contentId, caption)` after 0G upload (image is in the content, not on-chain); likes will call `like`/`unlike` on-chain.

## Interface (plan.md)

- `createPost(string contentId, string caption)` — contentId = 0G root of post content (JSON: body + optional imageRootHash). Image is uploaded to 0G; no image hash stored on-chain.
- `like(uint256 postId)` / `unlike(uint256 postId)`
- View: `posts(id)` (author, contentId, caption, createdAt), `postCount`, `likes(postId, user)`, `likeCount(postId)`

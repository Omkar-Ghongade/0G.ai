/**
 * 0G Social contract — from plan.md.
 * createPost(contentId, caption), like(postId), unlike(postId).
 */

import { Contract, JsonRpcProvider } from "ethers";
import { fetchContent } from "./api";

/** 0G root hash: 0x + 64 hex. Skip API when contract has post id or placeholder. */
function isOgRootHash(id) {
  return typeof id === "string" && /^0x[a-fA-F0-9]{64}$/.test(id.trim());
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";
const EVM_RPC = (import.meta.env.VITE_EVM_RPC ?? "https://evmrpc-testnet.0g.ai").replace(/\/$/, "");

export const OGSocialABI = [
  "function createPost(string calldata contentId, string calldata caption) external",
  "function like(uint256 postId) external",
  "function unlike(uint256 postId) external",
  "function posts(uint256) view returns (address author, string contentId, string caption, uint256 createdAt)",
  "function postCount() view returns (uint256)",
  "function likes(uint256, address) view returns (bool)",
  "function likeCount(uint256) view returns (uint256)",
  "event PostCreated(uint256 indexed postId, address author, string contentId, uint256 createdAt)",
];

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) return null;
  return new Contract(CONTRACT_ADDRESS, OGSocialABI, signerOrProvider);
}

export function hasContract() {
  return Boolean(CONTRACT_ADDRESS);
}

/** Read-only provider for 0G chain (no wallet). */
export function getReadOnlyProvider() {
  return new JsonRpcProvider(EVM_RPC);
}

/**
 * Load all posts from the smart contract and resolve content from backend.
 * @param {import('ethers').Provider} provider - Read-only provider (e.g. getReadOnlyProvider())
 * @param {string | null} walletAddress - Current user address for likedByUser
 * @returns {Promise<Array<{ postId: string, author: string, contentId: string, body: string, imageUrl: string | null, likeCount: number, likedByUser: boolean, createdAt: number }>>}
 */
export async function loadPostsFromContract(provider, walletAddress = null) {
  const contract = getContract(provider);
  if (!contract) return [];

  const count = await contract.postCount();
  const n = Number(count);
  if (n === 0) return [];

  const rawPosts = await Promise.all(
    Array.from({ length: n }, (_, i) => contract.posts(i + 1))
  );

  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

  const postsWithContent = await Promise.all(
    rawPosts.map(async (p, i) => {
      const postId = String(i + 1);
      const author = p.author;
      const contentId = p.contentId;
      const caption = p.caption;
      const createdAt = Number(p.createdAt) * 1000;

      const [content, likeCount, likedByUser] = await Promise.all([
        isOgRootHash(contentId) ? fetchContent(contentId) : Promise.resolve({ body: "", imageRootHash: null }),
        contract.likeCount(i + 1),
        walletAddress ? contract.likes(i + 1, walletAddress) : Promise.resolve(false),
      ]);

      const body = (content?.body && content.body.trim()) ? content.body : (caption ?? "");
      const imageRootHash = (content?.imageRootHash ?? "").trim();
      const imageUrl = isOgRootHash(imageRootHash)
        ? `${API_BASE}/api/raw/${encodeURIComponent(imageRootHash)}`
        : null;

      return {
        postId,
        author,
        contentId,
        body,
        imageUrl,
        likeCount: Number(likeCount),
        likedByUser: Boolean(likedByUser),
        createdAt,
      };
    })
  );

  return postsWithContent.sort((a, b) => b.createdAt - a.createdAt);
}

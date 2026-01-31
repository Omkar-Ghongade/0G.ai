/**
 * 0G Storage – same as SDK example, but signer from MetaMask (no private key in frontend).
 * indexer.upload(file, evmRpc, signer) — we use Blob(browserFile) for browser.
 */

import { Blob as ZgBlob, Indexer } from "@0glabs/0g-ts-sdk";
import { BrowserProvider } from "ethers";

const evmRpc = "https://evmrpc-testnet.0g.ai/";
const indRpc = "https://indexer-storage-testnet-turbo.0g.ai";

/** Get signer from MetaMask (browser). In Node you’d use new ethers.Wallet(privateKey, provider). */
export async function getSigner() {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.listAccounts();
  if (!accounts?.length) return null;
  return provider.getSigner();
}

async function uploadFile(file, signer) {
  const zgFile = new ZgBlob(file); // browser: Blob(File); Node would use ZgFile.fromFilePath(path)
  const indexer = new Indexer(indRpc);
  const [tx, err] = await indexer.upload(zgFile, evmRpc, signer);
  await zgFile.close?.();
  if (err) throw new Error(err?.message ?? String(err));
  if (!tx?.rootHash) throw new Error("Upload succeeded but no root hash returned");
  return { rootHash: tx.rootHash, txHash: tx.txHash ?? "" };
}

/**
 * Upload post content to 0G Storage. If an image is provided, uploads the image first,
 * then uploads a JSON manifest { body, imageRootHash }. The returned contentId is the
 * root hash of the manifest (used to resolve the post later).
 *
 * @param {string} body - Post text
 * @param {File | null} imageFile - Optional image file
 * @param {import('ethers').Signer} signer - Wallet signer (e.g. from MetaMask)
 * @returns {Promise<{ contentId: string, imageRootHash: string | null, txHash: string }>}
 */
export async function uploadPostTo0G(body, imageFile, signer) {
  let imageRootHash = null;
  let lastTxHash = "";

  if (imageFile) {
    const imgResult = await uploadFile(imageFile, signer);
    imageRootHash = imgResult.rootHash;
    lastTxHash = imgResult.txHash;
  }

  const manifest = { body, imageRootHash };
  const jsonStr = JSON.stringify(manifest);
  const manifestFile = new File([jsonStr], "post.json", { type: "application/json" });
  const manifestResult = await uploadFile(manifestFile, signer);

  return {
    contentId: manifestResult.rootHash,
    imageRootHash,
    txHash: manifestResult.txHash || lastTxHash,
  };
}

/**
 * Backend like zgDrive: receives post/file, uploads to 0G with server wallet (env PRIVATE_KEY).
 * @see https://github.com/udhaykumarbala/zgDrive
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { Indexer, ZgFile, getFlowContract, getMarketContract } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";

const app = express();
const evmRpc = (process.env.EVM_RPC || "https://rpc.ankr.com/0g_galileo_testnet_evm").replace(/\/$/, "");
const indRpc = (process.env.IND_RPC || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");
const privateKey = process.env.PRIVATE_KEY;

const uploadDir = join(tmpdir(), "0g-social-uploads");
const multerUpload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true }));
app.use(express.json());

function getSigner() {
  if (!privateKey) return null;
  const provider = new ethers.JsonRpcProvider(evmRpc);
  return new ethers.Wallet(privateKey, provider);
}

async function uploadFileTo0G(filePath, signer) {
  const file = await ZgFile.fromFilePath(filePath);
  try {
    const indexer = new Indexer(indRpc);
    const [tx, err] = await indexer.upload(file, evmRpc, signer, undefined, undefined, {
      gasLimit: 800000n,
    });
    await file.close();
    if (err) throw err;
    if (!tx?.rootHash) throw new Error("No root hash returned");
    return { rootHash: tx.rootHash, txHash: tx.txHash ?? "" };
  } finally {
    await file.close().catch(() => {});
  }
}

app.get("/health", (req, res) => {
  res.send("OK");
});

/** GET /diagnostics – flow paused?, chainId, market. Use when upload reverts. */
app.get("/diagnostics", async (req, res) => {
  const signer = getSigner();
  if (!signer) return res.status(503).json({ error: "PRIVATE_KEY not set" });
  try {
    const indexer = new Indexer(indRpc);
    const [clients, err] = await indexer.selectNodes(1);
    if (err || !clients?.length) return res.status(500).json({ error: "Could not get nodes", detail: err?.message });
    const status = await clients[0].getStatus();
    if (!status?.networkIdentity?.flowAddress) return res.status(500).json({ error: "No flow address from node" });
    const flow = getFlowContract(status.networkIdentity.flowAddress, signer);
    const paused = await flow.paused();
    const marketAddr = await flow.market();
    const network = await signer.provider.getNetwork();
    let pricePerSector = null;
    if (marketAddr) {
      try {
        const market = getMarketContract(marketAddr, signer.provider);
        pricePerSector = (await market.pricePerSector()).toString();
      } catch (e) {
        pricePerSector = e?.message ?? "failed";
      }
    }
    return res.json({
      flowAddress: status.networkIdentity.flowAddress,
      chainId: Number(network.chainId),
      paused: Boolean(paused),
      marketAddr: marketAddr ?? null,
      pricePerSector,
      evmRpc,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Diagnostics failed" });
  }
});

/** 0G root hash: 0x + 64 hex chars. Reject post ids or invalid values. */
function isValidContentId(id) {
  return typeof id === "string" && /^0x[a-fA-F0-9]{64}$/.test(id.trim());
}

/** GET /api/content/:contentId – resolve 0G content by root hash (JSON: body, imageRootHash). */
app.get("/api/content/:contentId", async (req, res) => {
  const contentId = req.params.contentId?.trim();
  if (!contentId) return res.status(400).json({ error: "contentId required" });
  if (!isValidContentId(contentId))
    return res.status(400).json({ error: "contentId must be a 0G root hash (0x + 64 hex chars)" });
  const tempPath = join(uploadDir, `content-${randomBytes(8).toString("hex")}`);
  try {
    await mkdir(uploadDir, { recursive: true });
    const indexer = new Indexer(indRpc);
    const err = await indexer.download(contentId, tempPath, false);
    if (err) return res.status(404).json({ error: "Content not found or download failed" });
    const raw = await readFile(tempPath, "utf8");
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Failed to resolve content" });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
});

/** GET /api/raw/:contentId – raw file from 0G (e.g. image by root hash). */
app.get("/api/raw/:contentId", async (req, res) => {
  const contentId = req.params.contentId?.trim();
  if (!contentId || !isValidContentId(contentId))
    return res.status(400).json({ error: "Valid contentId (0x + 64 hex) required" });
  const tempPath = join(uploadDir, `raw-${randomBytes(8).toString("hex")}`);
  try {
    await mkdir(uploadDir, { recursive: true });
    const indexer = new Indexer(indRpc);
    const err = await indexer.download(contentId, tempPath, false);
    if (err) return res.status(404).json({ error: "Not found or download failed" });
    const buf = await readFile(tempPath);
    res.set("Cache-Control", "public, max-age=86400");
    res.type("application/octet-stream");
    res.send(buf);
  } catch (e) {
    return res.status(500).json({ error: e?.message ?? "Failed to resolve content" });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
});

app.post("/api/post", multerUpload.fields([{ name: "body", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
  const signer = getSigner();
  if (!signer) {
    return res.status(503).json({ error: "Server not configured: set PRIVATE_KEY in .env (wallet with testnet balance)" });
  }

  const body = (req.body?.body != null ? String(req.body.body) : "").trim();
  if (!body) {
    return res.status(400).json({ error: "Post body is required" });
  }

  const imageFile = req.files?.image?.[0];
  let imageRootHash = null;
  const tempPaths = [];

  try {
    await mkdir(uploadDir, { recursive: true });
    const prefix = randomBytes(8).toString("hex");

    if (imageFile?.buffer) {
      const imagePath = join(uploadDir, `${prefix}-image`);
      await writeFile(imagePath, imageFile.buffer);
      tempPaths.push(imagePath);
      const imgResult = await uploadFileTo0G(imagePath, signer);
      imageRootHash = imgResult.rootHash;
    }

    const manifest = { body, imageRootHash };
    const manifestPath = join(uploadDir, `${prefix}-post.json`);
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");
    tempPaths.push(manifestPath);

    const manifestResult = await uploadFileTo0G(manifestPath, signer);

    for (const p of tempPaths) {
      await unlink(p).catch(() => {});
    }

    return res.json({
      contentId: manifestResult.rootHash,
      imageRootHash,
      txHash: manifestResult.txHash,
    });
  } catch (err) {
    for (const p of tempPaths) {
      await unlink(p).catch(() => {});
    }
    console.error("Upload error:", err);
    return res.status(500).json({ error: err?.message ?? "Upload to 0G failed" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, async () => {
  console.log(`0g-social backend at http://localhost:${port}`);
  if (!privateKey) {
    console.warn("PRIVATE_KEY not set – POST /api/post will return 503");
    return;
  }
  const signer = getSigner();
  try {
    const balance = await signer.provider.getBalance(signer.address);
    const balance0G = (Number(balance) / 1e18).toFixed(6);
    console.log(`Wallet ${signer.address} balance: ${balance0G} 0G (testnet)`);
    if (balance === 0n) {
      console.warn("Balance is 0 – get testnet 0G from https://faucet.0g.ai (0G Galileo, chainId 16602) or uploads will revert.");
    }
  } catch (e) {
    console.warn("Could not check wallet balance:", e?.message);
  }
});

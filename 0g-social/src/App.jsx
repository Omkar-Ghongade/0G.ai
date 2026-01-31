import { useState, useCallback, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import CreatePostModal from "./components/CreatePostModal";
import ConnectWalletModal from "./components/ConnectWalletModal";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import { useMetaMask } from "./hooks/useMetaMask";
import { initialMockPosts } from "./data/mockPosts";
import { createPostViaBackend } from "./lib/api";
import { getContract, hasContract, getReadOnlyProvider, loadPostsFromContract } from "./lib/contract";
import { getSigner } from "./lib/ogStorage";

let nextId = 4;

export default function App() {
  const [posts, setPosts] = useState(initialMockPosts);
  const [createOpen, setCreateOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  const {
    address: walletAddress,
    shortAddress: walletShortAddress,
    error: walletError,
    isConnecting: walletConnecting,
    connect: connectMetaMask,
    disconnect: disconnectWallet,
    clearError: clearWalletError,
  } = useMetaMask();

  useEffect(() => {
    if (!hasContract()) {
      const t = setTimeout(() => setFeedLoading(false), 500);
      return () => clearTimeout(t);
    }
    setFeedLoading(true);
    const provider = getReadOnlyProvider();
    loadPostsFromContract(provider, walletAddress ?? null)
      .then((loaded) => {
        setPosts(loaded);
      })
      .catch((err) => {
        console.error("Load feed from contract failed:", err);
        setPosts([]);
      })
      .finally(() => setFeedLoading(false));
  }, [walletAddress]);

  const handleLike = useCallback(
    async (postId) => {
      const id = typeof postId === "string" ? Number(postId) : postId;
      if (hasContract() && walletAddress) {
        const signer = await getSigner();
        const contract = signer && getContract(signer);
        if (!contract) return;
        const post = posts.find((p) => p.postId === String(postId));
        const currentlyLiked = post?.likedByUser ?? false;
        try {
          if (currentlyLiked) await contract.unlike(id);
          else await contract.like(id);
          const [newCount, liked] = await Promise.all([
            contract.likeCount(id),
            contract.likes(id, walletAddress),
          ]);
          setPosts((prev) =>
            prev.map((p) =>
              p.postId !== String(postId)
                ? p
                : { ...p, likeCount: Number(newCount), likedByUser: liked }
            )
          );
        } catch (err) {
          console.error("Like/unlike failed:", err);
        }
        return;
      }
      setPosts((prev) =>
        prev.map((p) => {
          if (p.postId !== postId) return p;
          const liked = !p.likedByUser;
          return {
            ...p,
            likedByUser: liked,
            likeCount: p.likeCount + (liked ? 1 : -1),
          };
        })
      );
    },
    [walletAddress, posts]
  );

  const [createError, setCreateError] = useState(null);

  const handleCreatePost = useCallback(
    async ({ body, imageUrl, imageFile }) => {
      setCreateError(null);
      if (hasContract() && !walletAddress) {
        setCreateError("Connect your wallet to post (smart contract is configured).");
        return;
      }
      setCreateSubmitting(true);
      const caption = (body || "").slice(0, 80);
      let contentId = null;
      try {
        const res = await createPostViaBackend(body, imageFile ?? null);
        contentId = res.contentId;
      } catch (err) {
        const msg = err?.message || "";
        const is0gRevert = msg.includes("0x22E03") || msg.includes("execution reverted") || msg.includes("transaction execution reverted");
        if (hasContract() && walletAddress && is0gRevert) {
          contentId = "0x" + "0".repeat(64);
        } else {
          setCreateError(msg || "Upload failed. Is the backend running?");
          setCreateSubmitting(false);
          return;
        }
      }
      try {
        let postId = String(nextId++);
        let likeCount = 0;
        let likedByUser = false;
        if (hasContract() && walletAddress && contentId) {
          const signer = await getSigner();
          const contract = signer && getContract(signer);
          if (contract) {
            const tx = await contract.createPost(contentId, caption);
            const receipt = await tx.wait();
            const iface = contract.interface;
            for (const log of receipt?.logs ?? []) {
              try {
                const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
                if (parsed?.name === "PostCreated" && parsed.args?.postId != null)
                  postId = String(parsed.args.postId);
              } catch (_) {}
            }
          }
        }
        const newPost = {
          postId,
          author: walletAddress || "0xAnonymous",
          contentId: contentId || `mock-${Date.now()}`,
          createdAt: Date.now(),
          body,
          imageUrl,
          likeCount,
          likedByUser,
        };
        setPosts((prev) => [newPost, ...prev]);
        setCreateOpen(false);
      } catch (err) {
        setCreateError(err?.message || "Contract createPost failed.");
      } finally {
        setCreateSubmitting(false);
      }
    },
    [walletAddress]
  );

  const handleConnectWallet = useCallback(async () => {
    const connected = await connectMetaMask();
    if (connected) setConnectOpen(false);
    else setConnectOpen(true);
  }, [connectMetaMask]);

  return (
    <>
      <Header
        onNewPost={() => setCreateOpen(true)}
        walletAddress={walletAddress}
        walletShortAddress={walletShortAddress}
        onConnectMetaMask={handleConnectWallet}
        isConnecting={walletConnecting}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              posts={posts}
              onLike={handleLike}
              loading={feedLoading}
            />
          }
        />
        <Route
          path="/post/:id"
          element={<PostPage posts={posts} onLike={handleLike} />}
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              walletAddress={walletAddress}
              walletShortAddress={walletShortAddress}
              posts={posts}
              onLike={handleLike}
              onDisconnect={disconnectWallet}
              onNewPost={() => setCreateOpen(true)}
            />
          }
        />
      </Routes>

      {createOpen && (
        <CreatePostModal
          onClose={() => {
            setCreateOpen(false);
            setCreateError(null);
          }}
          onSubmit={handleCreatePost}
          isSubmitting={createSubmitting}
          error={createError}
        />
      )}
      {connectOpen && (walletError || typeof window !== "undefined" && !window.ethereum) && (
        <ConnectWalletModal
          onClose={() => {
            setConnectOpen(false);
            clearWalletError();
          }}
          error={walletError}
          hasProvider={typeof window !== "undefined" && !!window.ethereum}
        />
      )}
    </>
  );
}

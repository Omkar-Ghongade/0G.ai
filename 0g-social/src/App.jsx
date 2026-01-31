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
    const t = setTimeout(() => setFeedLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleLike = useCallback((postId) => {
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
  }, []);

  const handleCreatePost = useCallback(
    ({ body, imageUrl }) => {
      setCreateSubmitting(true);
      const author = walletAddress || "0xMock...user";
      setTimeout(() => {
        const newPost = {
          postId: String(nextId++),
          author,
          contentId: `mock-cid-${Date.now()}`,
          createdAt: Date.now(),
          body,
          imageUrl,
          likeCount: 0,
          likedByUser: false,
        };
        setPosts((prev) => [newPost, ...prev]);
        setCreateSubmitting(false);
        setCreateOpen(false);
      }, 600);
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
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreatePost}
          isSubmitting={createSubmitting}
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

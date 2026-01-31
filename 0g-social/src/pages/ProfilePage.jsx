import { Link, useNavigate } from "react-router-dom";
import Feed from "../components/Feed";

export default function ProfilePage({
  walletAddress,
  walletShortAddress,
  posts,
  onLike,
  onDisconnect,
  onNewPost,
}) {
  const navigate = useNavigate();
  const myPosts = walletAddress
    ? posts.filter((p) => p.author.toLowerCase() === walletAddress.toLowerCase())
    : [];

  const handleDisconnect = () => {
    onDisconnect();
    navigate("/");
  };

  if (!walletAddress) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] p-8">
          <h1 className="text-2xl font-extrabold text-black mb-2">Your profile</h1>
          <p className="text-black/80 mb-4">
            Connect your wallet to see your posts here.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            Back to feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-black">Your profile</h1>
          <p className="text-black/70 font-bold mt-1" title={walletAddress}>
            {walletShortAddress}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          className="px-4 py-2 border-2 border-black bg-[var(--color-brutal-accent)] text-white font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          Disconnect
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-extrabold text-black mb-3">Create post</h2>
        <div className="bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] p-6">
          <p className="text-black/80 mb-4">Share something with the feed.</p>
          <button
            type="button"
            onClick={onNewPost}
            className="px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            New post
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-black mb-3">Your posts</h2>
        {myPosts.length === 0 ? (
          <div className="bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] p-6 text-center">
            <p className="text-black/70 font-bold">No posts yet.</p>
            <p className="text-black/60 text-sm mt-1">Create one above!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Feed posts={myPosts} onLike={onLike} />
          </div>
        )}
      </section>
    </main>
  );
}

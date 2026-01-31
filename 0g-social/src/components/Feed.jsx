import PostCard from "./PostCard";

export default function Feed({ posts, onLike }) {
  if (!posts.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold text-black/70">No posts yet.</p>
        <p className="text-black/60 mt-1">Be the first to post!</p>
      </div>
    );
  }

  const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {sorted.map((post) => (
        <PostCard key={post.postId} post={post} onLike={onLike} />
      ))}
    </div>
  );
}

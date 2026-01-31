import Feed from "../components/Feed";

export default function HomePage({ posts, onLike, loading }) {
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-lg font-bold text-black/70">Loading feed…</p>
      </div>
    );
  }

  return (
    <main>
      <Feed posts={posts} onLike={onLike} />
    </main>
  );
}

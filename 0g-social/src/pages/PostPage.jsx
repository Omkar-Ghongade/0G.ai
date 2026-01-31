import { useParams, Link } from "react-router-dom";
import { shortAddress, formatTime } from "../data/mockPosts";

export default function PostPage({ posts, onLike }) {
  const { id } = useParams();
  const post = posts.find((p) => p.postId === id);

  if (!post) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold text-black/70">Post not found.</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
        >
          Back to feed
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <article className="bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-bold text-black/80">
              {shortAddress(post.author)}
            </span>
            <span className="text-sm text-black/60">{formatTime(post.createdAt)}</span>
          </div>
          <div className="text-lg text-black/90 whitespace-pre-wrap mb-4">
            {post.body}
          </div>
          {post.imageUrl && (
            <div className="mb-4 rounded overflow-hidden border-2 border-black">
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-auto object-cover block"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onLike(post.postId)}
              className={`px-4 py-2 border-2 border-black font-bold transition-all ${
                post.likedByUser
                  ? "bg-[var(--color-brutal-like)] text-white shadow-[3px_3px_0_0_#000]"
                  : "bg-white text-black shadow-[3px_3px_0_0_#000] hover:bg-black/5"
              } hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5`}
            >
              ♥ {post.likeCount}
            </button>
            <Link
              to="/"
              className="text-sm font-bold text-black underline hover:no-underline"
            >
              ← Back to feed
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

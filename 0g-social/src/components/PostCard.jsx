import { Link } from "react-router-dom";
import { shortAddress, formatTime } from "../data/mockPosts";

const BODY_SNIPPET_LEN = 100;

export default function PostCard({ post, onLike }) {
  const snippet =
    post.body.length > BODY_SNIPPET_LEN
      ? `${post.body.slice(0, BODY_SNIPPET_LEN)}...`
      : post.body;

  return (
    <article className="bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[6px_6px_0_0_#000] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-bold text-black/80">
            {shortAddress(post.author)}
          </span>
          <span className="text-sm text-black/60">{formatTime(post.createdAt)}</span>
        </div>
        <p className="text-black/90 mb-3">{snippet}</p>
        {post.imageUrl && (
          <div className="mb-3 rounded overflow-hidden border-2 border-black">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full h-auto object-cover block"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onLike(post.postId)}
            className={`px-3 py-1.5 border-2 border-black font-bold text-sm transition-all ${
              post.likedByUser
                ? "bg-[var(--color-brutal-like)] text-white shadow-[3px_3px_0_0_#000]"
                : "bg-white text-black shadow-[3px_3px_0_0_#000] hover:bg-black/5"
            } hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5`}
          >
            ♥ {post.likeCount}
          </button>
          <Link
            to={`/post/${post.postId}`}
            className="text-sm font-bold text-black underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

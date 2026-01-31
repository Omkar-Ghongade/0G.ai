import { useState } from "react";

export default function CreatePostModal({ onClose, onSubmit, isSubmitting, error: externalError }) {
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const displayError = externalError ?? error;

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Post body is required.");
      return;
    }
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
    onSubmit({
      body: trimmed,
      imageUrl,
      imageFile: imageFile ?? null,
    });
    setBody("");
    setImageFile(null);
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
    >
      <div
        className="w-full max-w-lg bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[8px_8px_0_0_#000] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-post-title" className="text-xl font-extrabold mb-4 text-black">
          New post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="body" className="block text-sm font-bold mb-1 text-black">
              Post *
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              required
              className="w-full px-3 py-2 border-2 border-black bg-white font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 resize-y"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-bold mb-1 text-black">
              Image (optional)
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 border-2 border-black bg-white font-medium file:mr-2 file:border-2 file:border-black file:bg-[var(--color-brutal-primary)] file:px-3 file:py-1 file:font-bold"
            />
          </div>
          {displayError && (
            <p className="text-sm font-bold text-[var(--color-brutal-like)]">{displayError}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black bg-white font-bold shadow-[3px_3px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

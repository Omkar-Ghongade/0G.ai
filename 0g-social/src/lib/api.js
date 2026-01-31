/**
 * Backend API – storage like zgDrive: server uploads to 0G with env wallet.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * Resolve 0G content by root hash (body, imageRootHash). Backend GET /api/content/:contentId.
 * @param {string} contentId - Root hash from contract post
 * @returns {Promise<{ body?: string, imageRootHash?: string | null }>}
 */
export async function fetchContent(contentId) {
  const res = await fetch(`${API_BASE}/api/content/${encodeURIComponent(contentId)}`);
  if (!res.ok) return { body: "", imageRootHash: null };
  return res.json();
}

/**
 * Create a post via backend; backend uploads to 0G and returns contentId.
 * @param {string} body - Post text
 * @param {File | null} imageFile - Optional image file
 * @returns {Promise<{ contentId: string, imageRootHash?: string, txHash?: string }>}
 */
export async function createPostViaBackend(body, imageFile) {
  const form = new FormData();
  form.append("body", body);
  if (imageFile) form.append("image", imageFile);

  const res = await fetch(`${API_BASE}/api/post`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Upload failed (${res.status})`);
  }

  return res.json();
}

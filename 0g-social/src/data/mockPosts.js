// Post shape matching future contract + storage
// postId, author, contentId, createdAt + resolved body, imageUrl
export const initialMockPosts = [
  {
    postId: "1",
    author: "0xMock...a1b2",
    contentId: "mock-cid-1",
    createdAt: Date.now() - 86400000 * 2,
    body: "Building something new on 0G. Decentralized social with storage and chain. This is the beginning of a new feed.",
    imageUrl: "https://picsum.photos/600/400?random=1",
    likeCount: 12,
    likedByUser: false,
  },
  {
    postId: "2",
    author: "0xMock...c3d4",
    contentId: "mock-cid-2",
    createdAt: Date.now() - 86400000,
    body: "Sometimes you don't need a picture. Words are enough. Neobrutalist design forever.",
    imageUrl: null,
    likeCount: 5,
    likedByUser: true,
  },
  {
    postId: "3",
    author: "0xMock...e5f6",
    contentId: "mock-cid-3",
    createdAt: Date.now() - 3600000,
    body: "Short one. LFG.",
    imageUrl: "https://picsum.photos/600/400?random=3",
    likeCount: 0,
    likedByUser: false,
  },
];

export function shortAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

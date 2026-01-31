import { Link } from "react-router-dom";

export default function Header({
  onNewPost,
  walletAddress,
  walletShortAddress,
  onConnectMetaMask,
  isConnecting,
}) {
  const isConnected = !!walletAddress;

  return (
    <header className="border-b-4 border-black bg-[var(--color-brutal-surface)] shadow-[4px_4px_0_0_#000] sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black">
          <Link to="/" className="hover:underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded">
            0G Social
          </Link>
        </h1>
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              type="button"
              onClick={onNewPost}
              className="px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              New post
            </button>
          )}
          {isConnected ? (
            <Link
              to="/profile"
              className="px-4 py-2 border-2 border-black bg-white font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-block"
              title={walletAddress}
            >
              Profile ({walletShortAddress})
            </Link>
          ) : (
            <button
              type="button"
              onClick={onConnectMetaMask}
              disabled={isConnecting}
              className="px-4 py-2 border-2 border-black bg-[var(--color-brutal-accent)] text-white font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting…" : "Connect MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

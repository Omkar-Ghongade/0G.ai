export default function ConnectWalletModal({ onClose, error, hasProvider }) {
  const isNoProvider = hasProvider === false;
  const message = isNoProvider
    ? "MetaMask is not installed. Install the MetaMask extension to connect your wallet."
    : error || "Something went wrong.";

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-wallet-title"
    >
      <div
        className="w-full max-w-sm bg-[var(--color-brutal-surface)] border-4 border-black rounded-lg shadow-[8px_8px_0_0_#000] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="connect-wallet-title" className="text-xl font-extrabold mb-2 text-black">
          Connect MetaMask
        </h2>
        <p className="text-black/80 mb-4">{message}</p>
        {isNoProvider && (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mb-3 px-4 py-2 border-2 border-black bg-[var(--color-brutal-accent)] text-white font-bold text-center shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
          >
            Get MetaMask
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2 border-2 border-black bg-[var(--color-brutal-primary)] font-bold shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
}

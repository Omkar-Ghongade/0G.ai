import { useState, useCallback, useEffect } from "react";

function shortAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useMetaMask() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setError(null);
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not installed");
      return null;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const acc = accounts?.[0] ?? null;
      setAddress(acc);
      return acc;
    } catch (e) {
      const msg = e?.message || "Failed to connect";
      setError(msg);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts?.[0] ?? null);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Re-detect account on load (e.g. already connected in MetaMask)
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts?.[0]) setAddress(accounts[0]);
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    address,
    shortAddress: address ? shortAddress(address) : "",
    error,
    isConnecting,
    connect,
    disconnect,
    clearError,
    hasProvider: typeof window !== "undefined" && !!window.ethereum,
  };
}

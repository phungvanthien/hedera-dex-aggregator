import { useCallback } from "react";
import { hederaMainnet } from "../config/wagmi";

// Utility to prompt wallet to add/switch to Hedera mainnet
export async function addOrSwitchHederaMainnet() {
  if (!window.ethereum) throw new Error("No EVM wallet found");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x127" }], // 295 in hex
    });
  } catch (switchError: any) {
    // If the chain has not been added to MetaMask, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x127",
            chainName: hederaMainnet.name,
            nativeCurrency: hederaMainnet.nativeCurrency,
            rpcUrls: hederaMainnet.rpcUrls.default.http,
            blockExplorerUrls: [hederaMainnet.blockExplorers.default.url],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// React hook for connecting to EVM wallet and ensuring Hedera mainnet
export function useEvmWallet() {
  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error("No EVM wallet found");
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // Ensure Hedera mainnet is selected
    await addOrSwitchHederaMainnet();
  }, []);

  return { connect };
}

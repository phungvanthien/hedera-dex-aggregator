import { useCallback } from "react";
import { hederaTestnet } from "../config/wagmi";

// Utility to prompt wallet to add/switch to Hedera testnet
export async function addOrSwitchHederaTestnet() {
  if (!window.ethereum) throw new Error("No EVM wallet found");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x128" }], // 296 in hex
    });
  } catch (switchError: any) {
    // If the chain has not been added to MetaMask, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x128",
            chainName: hederaTestnet.name,
            nativeCurrency: hederaTestnet.nativeCurrency,
            rpcUrls: hederaTestnet.rpcUrls.default.http,
            blockExplorerUrls: [hederaTestnet.blockExplorers.default.url],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// React hook for connecting to EVM wallet and ensuring Hedera testnet
export function useEvmWallet() {
  const connect = useCallback(async () => {
    if (!window.ethereum) throw new Error("No EVM wallet found");
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });
    // Ensure Hedera testnet is selected
    await addOrSwitchHederaTestnet();
  }, []);

  return { connect };
}

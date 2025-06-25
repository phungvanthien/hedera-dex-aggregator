import { http, Transport } from "viem";
import {
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  sepolia,
  polygonMumbai,
  arbitrumGoerli,
  avalancheFuji,
  bsc,
  optimism,
  base,
  linea,
  lineaSepolia,
  bscTestnet,
  optimismGoerli,
  baseGoerli,
  lineaGoerli,
} from "wagmi/chains";
import { createConfig } from "wagmi";

const alchemyApiKey = import.meta.env.VITE_PUBLIC_ALCHEMY_API_KEY;

if (!alchemyApiKey) {
  throw new Error("Missing ALCHEMY_API_KEY");
}

// Hedera Testnet EVM chain config
export const hederaTestnet = {
  id: 296,
  name: "Hedera Testnet",
  network: "hedera-testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
    public: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: { name: "HashScan", url: "https://hashscan.io/testnet" },
  },
  testnet: true,
};

export const chains = [
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  sepolia,
  polygonMumbai,
  arbitrumGoerli,
  avalancheFuji,
  bsc,
  optimism,
  base,
  linea,
  lineaSepolia,
  bscTestnet,
  optimismGoerli,
  baseGoerli,
  lineaGoerli,
  hederaTestnet, // <-- Add Hedera testnet here
] as const;

export function config() {
  return createConfig({
    chains,
    transports: chains.reduce(
      (acc, chain) => ({
        ...acc,
        [chain.id]: http(`${chain.rpcUrls.default.http[0]}`),
      }),
      {}
    ) as Record<(typeof chains)[number]["id"], Transport>,
  });
}
declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof config>;
  }
}

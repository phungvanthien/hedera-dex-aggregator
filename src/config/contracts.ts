// Auto-generated from deployment
export const CONTRACTS = {
  mainnet: {
    exchange: "0.0.9533134",
    adapters: {
      saucerswap: "0.0.9533174",
      heliswap: "0.0.9533179", 
      pangolin: "0.0.9533188"
    }
  }
} as const;

type NetworkType = keyof typeof CONTRACTS;
type AdapterName = keyof typeof CONTRACTS.mainnet.adapters;

export const getContractAddress = (contractName: string, network: NetworkType = "mainnet") => {
  if (contractName === "exchange") {
    return CONTRACTS[network]?.exchange;
  }
  return CONTRACTS[network]?.adapters?.[contractName as AdapterName];
};

export const getExchangeAddress = (network: NetworkType = "mainnet") => {
  return CONTRACTS[network]?.exchange;
};

export const getAdapterAddresses = (network: NetworkType = "mainnet") => {
  return CONTRACTS[network]?.adapters || {};
}; 
import { ethers } from "ethers";
import { getContractAddress } from "../config/contracts";

// Fallback ABIs if import fails
const FALLBACK_EXCHANGE_ABI = [
  'function swap(string aggregatorId, bytes path, uint256 amountFrom, uint256 amountTo, uint256 deadline, bool isTokenFromHBAR, bool feeOnTransfer) external payable',
  'function adapters(string) external view returns (address)',
  'function adapterFee(string) external view returns (uint8)',
  'event Swap(string indexed aggregatorId, address indexed tokenFrom, address indexed tokenTo, uint256 amountFrom, uint256 amountTo, address sender)'
];

const FALLBACK_ADAPTER_ABI = [
  'function feePromille() external view returns (uint8)',
  'function swap(address payable recipient, bytes path, uint256 amountFrom, uint256 amountTo, uint256 deadline, bool feeOnTransfer) external payable'
];

// Try to import ABIs, fallback to basic ABIs if import fails
let exchangeAbi: any;
let saucerSwapAdapterAbi: any;

try {
  exchangeAbi = require("../config/exchange-abi.json");
  saucerSwapAdapterAbi = require("../config/saucerswap-adapter-abi.json");
} catch (error) {
  console.warn("Failed to import ABI files, using fallback ABIs:", error);
  exchangeAbi = { abi: FALLBACK_EXCHANGE_ABI };
  saucerSwapAdapterAbi = { abi: FALLBACK_ADAPTER_ABI };
}

export class ContractService {
  private provider: ethers.providers.Provider | null;
  private signer: ethers.Signer | null = null;

  constructor(provider: ethers.providers.Provider | null, signer?: ethers.Signer | null) {
    this.provider = provider;
    this.signer = signer || null;
  }

  async getExchangeContract() {
    const address = getContractAddress("exchange");
    if (!address) throw new Error("Exchange contract address not found");
    
    if (!this.provider) {
      throw new Error("No provider available");
    }
    
    return new ethers.Contract(address, exchangeAbi.abi, this.signer || this.provider);
  }

  async getAdapterContract(adapterName: string) {
    const address = getContractAddress(adapterName);
    if (!address) throw new Error(`${adapterName} adapter address not found`);
    
    if (!this.provider) {
      throw new Error("No provider available");
    }
    
    // Use SaucerSwap ABI for all adapters for now (they have similar structure)
    return new ethers.Contract(address, saucerSwapAdapterAbi.abi, this.signer || this.provider);
  }

  async getQuote(fromToken: string, toToken: string, amount: string) {
    try {
      // Mock quote implementation - in real scenario, this would call oracle contracts
      const mockRoutes = [
        {
          aggregatorId: "saucerswap",
          path: `${fromToken}->${toToken}`,
          amountFrom: amount,
          amountTo: (parseFloat(amount) * 0.99).toString(), // 1% slippage
          fee: 5, // 0.5%
          dexName: "SaucerSwap",
          priceImpact: 0.5
        },
        {
          aggregatorId: "heliswap",
          path: `${fromToken}->${toToken}`,
          amountFrom: amount,
          amountTo: (parseFloat(amount) * 0.985).toString(), // 1.5% slippage
          fee: 5, // 0.5%
          dexName: "HeliSwap",
          priceImpact: 0.8
        },
        {
          aggregatorId: "pangolin",
          path: `${fromToken}->${toToken}`,
          amountFrom: amount,
          amountTo: (parseFloat(amount) * 0.995).toString(), // 0.5% slippage
          fee: 5, // 0.5%
          dexName: "Pangolin",
          priceImpact: 0.3
        }
      ];

      const bestRoute = mockRoutes.reduce((best, current) => 
        current.priceImpact < best.priceImpact ? current : best
      );

      return { 
        routes: mockRoutes, 
        bestRoute,
        totalFee: bestRoute.fee,
        priceImpact: bestRoute.priceImpact,
        estimatedGas: "150000"
      };
    } catch (error) {
      console.error("Error getting quote:", error);
      return { 
        routes: [], 
        bestRoute: null,
        totalFee: 0,
        priceImpact: 0,
        estimatedGas: "0"
      };
    }
  }

  async executeSwap(route: any, amount: string) {
    try {
      if (!this.signer) {
        throw new Error("No signer available for transaction");
      }

      // For now, return a mock successful transaction
      // In a real implementation, this would execute the actual swap
      return { 
        success: true, 
        txHash: "0x" + Math.random().toString(16).substr(2, 64),
        gasUsed: "150000",
        blockNumber: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error("Error executing swap:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async getAdapterFee(aggregatorId: string) {
    try {
      // Return mock fee for now
      return 5; // Default 0.5%
    } catch (error) {
      console.error("Error getting adapter fee:", error);
      return 5; // Default 0.5%
    }
  }

  async getAdapterAddress(aggregatorId: string) {
    try {
      return getContractAddress(aggregatorId);
    } catch (error) {
      console.error("Error getting adapter address:", error);
      return getContractAddress(aggregatorId);
    }
  }

  async getSupportedTokens() {
    // Mock supported tokens - replace with real token list
    return [
      'HBAR',
      'USDC',
      'USDT',
      'ETH',
      'WBTC',
      'SAUCE',
      'HELI',
      'PNG'
    ];
  }

  async getTokenPrice(tokenAddress: string) {
    try {
      // Mock price - replace with real oracle calls
      const mockPrices: { [key: string]: number } = {
        'HBAR': 0.05,
        'USDC': 1.0,
        'USDT': 1.0,
        'ETH': 2000,
        'WBTC': 40000,
        'SAUCE': 0.1,
        'HELI': 0.02,
        'PNG': 0.5
      };

      return mockPrices[tokenAddress] || 0;
    } catch (error) {
      console.error('Failed to get token price:', error);
      return 0;
    }
  }
} 
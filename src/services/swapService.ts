import { ContractService } from "./contractService";

export interface SwapRoute {
  aggregatorId: string;
  path: string;
  amountFrom: string;
  amountTo: string;
  fee: number;
  dexName: string;
  priceImpact: number;
}

export interface SwapQuote {
  routes: SwapRoute[];
  bestRoute: SwapRoute | null;
  totalFee: number;
  priceImpact: number;
  estimatedGas: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  gasUsed?: string;
  blockNumber?: number;
  error?: string;
}

export class SwapService {
  private contractService: ContractService;

  constructor(provider: any, signer?: any) {
    this.contractService = new ContractService(provider, signer);
  }

  async getQuote(fromToken: string, toToken: string, amount: string): Promise<SwapQuote> {
    try {
      return await this.contractService.getQuote(fromToken, toToken, amount);
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

  async executeSwap(route: SwapRoute, amount: string): Promise<SwapResult> {
    try {
      return await this.contractService.executeSwap(route, amount);
    } catch (error) {
      console.error("Error executing swap:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  async getSupportedTokens(): Promise<string[]> {
    try {
      return await this.contractService.getSupportedTokens();
    } catch (error) {
      console.error("Error getting supported tokens:", error);
      return ['HBAR', 'USDC', 'USDT'];
    }
  }

  async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      return await this.contractService.getTokenPrice(tokenAddress);
    } catch (error) {
      console.error("Error getting token price:", error);
      return 0;
    }
  }

  async getAdapterFee(aggregatorId: string): Promise<number> {
    try {
      return await this.contractService.getAdapterFee(aggregatorId);
    } catch (error) {
      console.error("Error getting adapter fee:", error);
      return 5; // Default 0.5%
    }
  }
} 
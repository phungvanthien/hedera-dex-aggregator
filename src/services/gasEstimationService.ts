import { getContractAddress } from "@/config/contracts";

export interface GasEstimate {
  gasLimit: number;
  gasPrice: number;
  estimatedCost: string; // in HBAR
  confidence: 'low' | 'medium' | 'high';
}

export interface GasEstimationParams {
  contractAddress: string;
  functionName: string;
  parameters: any[];
  complexity: 'simple' | 'medium' | 'complex';
}

export class GasEstimationService {
  private static instance: GasEstimationService;

  // Base gas costs for different operations
  private static readonly BASE_GAS_COSTS = {
    simple: 150000,    // Simple operations like view functions
    medium: 300000,    // Medium complexity like basic swaps
    complex: 500000,   // Complex operations like multi-hop swaps
  };

  // Gas price in tinybars (current Hedera gas price)
  private static readonly GAS_PRICE = 1; // 1 tinybar per gas unit

  // HBAR to tinybar conversion
  private static readonly HBAR_TO_TINYBAR = 100000000;

  static getInstance(): GasEstimationService {
    if (!GasEstimationService.instance) {
      GasEstimationService.instance = new GasEstimationService();
    }
    return GasEstimationService.instance;
  }

  /**
   * Estimate gas for a swap transaction
   */
  async estimateSwapGas(
    fromToken: string,
    toToken: string,
    amount: string,
    dex: string
  ): Promise<GasEstimate> {
    try {
      console.log("GasEstimationService: Estimating gas for swap...");

      // Determine complexity based on tokens and DEX
      const complexity = this.getSwapComplexity(fromToken, toToken, dex);
      
      // Base gas limit
      let gasLimit = GasEstimationService.BASE_GAS_COSTS[complexity];

      // Adjust gas based on amount size
      const amountNum = parseFloat(amount);
      if (amountNum > 1000) {
        gasLimit += 50000; // Additional gas for large amounts
      } else if (amountNum > 100) {
        gasLimit += 25000; // Additional gas for medium amounts
      }

      // Adjust gas based on DEX complexity
      const dexAdjustment = this.getDexGasAdjustment(dex);
      gasLimit += dexAdjustment;

      // Calculate estimated cost
      const gasPrice = GasEstimationService.GAS_PRICE;
      const totalTinybars = gasLimit * gasPrice;
      const estimatedCost = (totalTinybars / GasEstimationService.HBAR_TO_TINYBAR).toFixed(6);

      // Determine confidence level
      const confidence = this.getConfidenceLevel(complexity, amountNum);

      const estimate: GasEstimate = {
        gasLimit,
        gasPrice,
        estimatedCost,
        confidence
      };

      console.log("GasEstimationService: Gas estimate:", estimate);

      return estimate;

    } catch (error) {
      console.error("GasEstimationService: Gas estimation failed:", error);
      
      // Return conservative estimate
      return {
        gasLimit: 500000,
        gasPrice: GasEstimationService.GAS_PRICE,
        estimatedCost: "0.005000",
        confidence: 'low'
      };
    }
  }

  /**
   * Get swap complexity based on tokens and DEX
   */
  private getSwapComplexity(fromToken: string, toToken: string, dex: string): 'simple' | 'medium' | 'complex' {
    // Simple: HBAR to USDC on SaucerSwap
    if ((fromToken === 'HBAR' && toToken === 'USDC') || 
        (fromToken === 'USDC' && toToken === 'HBAR')) {
      if (dex === 'saucerswap') return 'simple';
    }

    // Medium: Any token pair on established DEXs
    if (['saucerswap', 'heliswap', 'pangolin'].includes(dex.toLowerCase())) {
      return 'medium';
    }

    // Complex: Multi-hop or new DEXs
    return 'complex';
  }

  /**
   * Get gas adjustment based on DEX
   */
  private getDexGasAdjustment(dex: string): number {
    const adjustments = {
      saucerswap: 0,      // Well-optimized
      heliswap: 10000,    // Slightly more complex
      pangolin: 15000,    // More complex
      default: 25000      // Unknown DEX
    };

    return adjustments[dex.toLowerCase() as keyof typeof adjustments] || adjustments.default;
  }

  /**
   * Get confidence level based on complexity and amount
   */
  private getConfidenceLevel(complexity: string, amount: number): 'low' | 'medium' | 'high' {
    // High confidence: Simple swaps with small amounts
    if (complexity === 'simple' && amount < 100) return 'high';
    
    // Medium confidence: Medium complexity or medium amounts
    if (complexity === 'medium' && amount < 1000) return 'medium';
    if (complexity === 'simple' && amount >= 100 && amount < 1000) return 'medium';
    
    // Low confidence: Complex swaps or large amounts
    // BUT: This should NOT block the swap, just indicate uncertainty
    return 'low';
  }

  /**
   * Check if swap should be allowed based on confidence level
   * IMPORTANT: Confidence level should NOT block swaps, only provide warnings
   */
  canProceedWithSwap(confidence: string): boolean {
    // All confidence levels should allow swaps
    // LOW confidence just means higher uncertainty, not a block
    return true;
  }

  /**
   * Get warning message for low confidence swaps
   */
  getConfidenceWarning(confidence: string): string | null {
    if (confidence === 'low') {
      return 'Gas estimation has low confidence. Transaction may cost more than estimated.';
    }
    if (confidence === 'medium') {
      return 'Gas estimation has medium confidence. Consider reviewing before proceeding.';
    }
    return null;
  }

  /**
   * Get current gas price from network
   */
  async getCurrentGasPrice(): Promise<number> {
    try {
      // In a real implementation, this would fetch from Hedera network
      // For now, return the default gas price
      return GasEstimationService.GAS_PRICE;
    } catch (error) {
      console.error("GasEstimationService: Failed to get current gas price:", error);
      return GasEstimationService.GAS_PRICE;
    }
  }

  /**
   * Validate gas estimate
   */
  validateGasEstimate(estimate: GasEstimate): boolean {
    return (
      estimate.gasLimit > 0 &&
      estimate.gasLimit <= 1000000 && // Max gas limit
      estimate.gasPrice > 0 &&
      parseFloat(estimate.estimatedCost) > 0
    );
  }

  /**
   * Format gas estimate for display
   */
  formatGasEstimate(estimate: GasEstimate): string {
    return `${estimate.estimatedCost} HBAR (${estimate.gasLimit.toLocaleString()} gas)`;
  }

  /**
   * Get gas estimate with safety margin
   */
  getGasWithSafetyMargin(estimate: GasEstimate, margin: number = 0.2): GasEstimate {
    const safetyGasLimit = Math.floor(estimate.gasLimit * (1 + margin));
    const safetyCost = (safetyGasLimit * estimate.gasPrice / GasEstimationService.HBAR_TO_TINYBAR).toFixed(6);

    return {
      ...estimate,
      gasLimit: safetyGasLimit,
      estimatedCost: safetyCost
    };
  }
}

export const gasEstimationService = GasEstimationService.getInstance(); 
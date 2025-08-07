import { poolPriceService } from "@/services/poolPriceService";
import { ethers } from "ethers";
import { realHashConnectService, SwapTransactionParams } from "./realHashConnectService";
import { autoSessionRefreshService } from "./autoSessionRefreshService";
import { tokenAssociationService } from "./tokenAssociationService";
import { getContractAddress } from "@/config/contracts";
import EXCHANGE_ABI from "@/config/exchange-abi.json";

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  price?: number;
}

export interface Quote {
  dex: string;
  outputAmount: string;
  priceImpact: string;
  fee: string;
  route: string[];
  isBest?: boolean;
  pool_address?: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

export class HederaContractService {
  private exchangeContract: any = null;

  constructor() {
    this.initializeContracts();
  }

  private initializeContracts() {
    try {
      const exchangeAddress = getContractAddress("exchange");
      if (exchangeAddress) {
        console.log("Exchange contract address:", exchangeAddress);
      }
    } catch (error) {
      console.error("Error initializing contracts:", error);
    }
  }

  async getQuotes(
    fromToken: Token,
    toToken: Token,
    amount: string
  ): Promise<Quote[]> {
    try {
      console.log("HederaContractService: Getting quotes for:", {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amount
      });
      
      const inputAmount = parseFloat(amount);
      if (inputAmount <= 0) {
        throw new Error("Invalid input amount");
      }

      // Lấy danh sách pool từ poolPriceService (đã fetch từ API)
      const { poolPriceService } = await import("@/services/poolPriceService");
      const poolList = poolPriceService.getPoolList();
      
      console.log("HederaContractService: Available pools:", poolList.length);
      console.log("HederaContractService: Pool list:", poolList);
      // Tìm pool có giá tốt nhất cho cặp fromToken/toToken (giống Market Overview)
      let bestPool = null;
      let bestPrice = 0;
      let bestIsDirect = true;
      for (const p of poolList) {
        // Chỉ xét pool đúng cặp
        if (
          (p.token0 === fromToken.symbol && p.token1 === toToken.symbol) ||
          (p.token0 === toToken.symbol && p.token1 === fromToken.symbol)
        ) {
          // Lấy reserves đúng chiều
          let reserveIn, reserveOut, decimalsIn, decimalsOut, isDirect;
          if (p.token0 === fromToken.symbol) {
            reserveIn = Number(p.reserve0) / Math.pow(10, p.token0Decimals);
            reserveOut = Number(p.reserve1) / Math.pow(10, p.token1Decimals);
            decimalsIn = p.token0Decimals;
            decimalsOut = p.token1Decimals;
            isDirect = true;
          } else {
            reserveIn = Number(p.reserve1) / Math.pow(10, p.token1Decimals);
            reserveOut = Number(p.reserve0) / Math.pow(10, p.token0Decimals);
            decimalsIn = p.token1Decimals;
            decimalsOut = p.token0Decimals;
            isDirect = false;
          }
          if (reserveIn > 0 && reserveOut > 0) {
            const price = reserveOut / reserveIn;
            if (price > bestPrice) {
              bestPrice = price;
              bestPool = { ...p, reserveIn, reserveOut, decimalsIn, decimalsOut, isDirect };
            }
          }
        }
      }
      if (!bestPool) {
        throw new Error("No pool found for this pair");
      }
      // Chuẩn hóa inputAmount về decimal của reserveIn
      const inputAmountNorm = inputAmount; // Đã là số thực, không cần đổi đơn vị
      // Tính outputAmount chuẩn hóa
      const outputAmount = inputAmountNorm * bestPrice;
      // Tính phí (lấy fee thấp nhất của DEX, hoặc lấy từ bestPool nếu có)
      const fee = 0.002; // 0.2% (có thể lấy từ bestPool nếu có)
      const outputAfterFee = outputAmount * (1 - fee);
      // Tạo quote duy nhất từ pool tốt nhất
      const quote: Quote = {
        dex: bestPool.name.split(" ")[0],
        outputAmount: outputAfterFee.toFixed(bestPool.decimalsOut),
        priceImpact: "0.2", // có thể tính thực tế nếu cần
        fee: (fee * 100).toFixed(2),
        route: [bestPool.name.split(" ")[0]],
        isBest: true,
        pool_address: bestPool.address,
      };
      return [quote];
    } catch (error) {
      console.error("Error getting best pool quote:", error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("No pool found")) {
          throw new Error("No trading pool available for this token pair");
        } else if (error.message.includes("Invalid input")) {
          throw new Error("Please enter a valid amount");
        } else {
          throw new Error(`Failed to fetch quotes: ${error.message}`);
        }
      } else {
        throw new Error("Failed to fetch quotes from smart contracts");
      }
    }
  }

  // Execute swap using HashPack only
  async executeSwap(
    quote: Quote,
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 0.5
  ): Promise<SwapResult> {
    try {
      console.log("Executing swap with HashPack:", { 
        quote, 
        fromToken: fromToken.symbol, 
        toToken: toToken.symbol, 
        amount, 
        slippage 
      });

      // Step 1: Check and auto-refresh session if needed
      console.log("HederaContractService: Checking session status before swap...");
      
      // First, try to initialize HashConnect if not already done
      const { hashConnectSessionManager } = await import('./hashConnectSessionManager');
      if (!hashConnectSessionManager.isInitialized()) {
        console.log("HederaContractService: HashConnect not initialized, attempting initialization...");
        const initialized = await hashConnectSessionManager.initialize();
        if (!initialized) {
          throw new Error("Failed to initialize HashConnect. Please refresh the page and try again.");
        }
      }

      // Try to connect to local wallet if not connected
      if (!hashConnectSessionManager.isConnected()) {
        console.log("HederaContractService: HashConnect not connected, attempting connection...");
        const connected = await hashConnectSessionManager.connectToLocalWallet();
        if (!connected) {
          throw new Error("HashPack wallet not connected. Please ensure HashPack extension is installed and unlocked.");
        }
      }

      // Check if session is ready for transactions
      if (!hashConnectSessionManager.isSessionReady()) {
        console.log("HederaContractService: Session not ready, attempting to establish session...");
        const sessionEstablished = await hashConnectSessionManager.forceEstablishSession();
        if (!sessionEstablished) {
          throw new Error("HashPack session not established. Please try reconnecting your wallet.");
        }
      }

      // Check if session is ready for transactions
      if (!hashConnectSessionManager.isSessionReady()) {
        console.log("HederaContractService: Session not ready, attempting to establish session...");
        const sessionEstablished = await hashConnectSessionManager.forceEstablishSession();
        if (!sessionEstablished) {
          throw new Error("HashPack session not established. Please try reconnecting your wallet.");
        }
      }

      // Now check session status
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        throw new Error("HashPack wallet not connected. Please ensure HashPack is installed and connected.");
      }

      console.log("HederaContractService: Session is healthy, proceeding with swap...");
      console.log("HederaContractService: Connected accounts:", sessionStatus.connectedAccounts);

      // Step 2: Prepare tokens (associate and approve if needed)
      console.log("HederaContractService: Preparing tokens for swap...");
      const exchangeAddress = getContractAddress("exchange");
      
      if (!exchangeAddress) {
        throw new Error("Exchange contract not found");
      }

      // Prepare fromToken (associate if needed, approve if needed)
      const fromTokenPreparation = await tokenAssociationService.prepareTokenForSwap(
        fromToken,
        exchangeAddress,
        this.toSmallestUnit(amount, fromToken.decimals)
      );

      if (!fromTokenPreparation.success) {
        throw new Error(`Failed to prepare fromToken: ${fromTokenPreparation.error}`);
      }

      if (fromTokenPreparation.needsAssociation) {
        console.log("HederaContractService: Token association completed");
      }

      if (fromTokenPreparation.needsApproval) {
        console.log("HederaContractService: Token approval completed");
      }

      // Validate inputs
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount");
      }

      if (!quote || !quote.dex) {
        throw new Error("Invalid quote");
      }

      // Get contract addresses
      const adapterAddress = getContractAddress(quote.dex.toLowerCase());

      console.log("Contract addresses:", { 
        exchangeAddress, 
        adapterAddress, 
        dex: quote.dex,
        dexLower: quote.dex.toLowerCase()
      });

      if (!exchangeAddress) {
        throw new Error("Exchange contract not found");
      }

      if (!adapterAddress) {
        throw new Error(`Adapter for ${quote.dex} not found`);
      }

      // Calculate minimum output amount with slippage
      const outputAmount = parseFloat(quote.outputAmount);
      const minOutputAmount = outputAmount * (1 - slippage / 100);

      // Prepare swap parameters
      const swapParams = {
        aggregatorId: quote.dex.toLowerCase(),
        path: this.encodePath(fromToken.address, toToken.address),
        amountFrom: this.toSmallestUnit(amount, fromToken.decimals),
        amountTo: this.toSmallestUnit(minOutputAmount.toString(), toToken.decimals),
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        isTokenFromHBAR: fromToken.symbol === "HBAR",
        feeOnTransfer: false
      };

      console.log("Swap parameters:", swapParams);

      // Use HashPack only - no MetaMask fallback
      try {
        // Prepare transaction parameters for HashPack
        const swapTransactionParams: SwapTransactionParams = {
          contractAddress: exchangeAddress,
          aggregatorId: swapParams.aggregatorId,
          path: swapParams.path,
          amountFrom: swapParams.amountFrom,
          amountTo: swapParams.amountTo,
          deadline: swapParams.deadline.toString(),
          isTokenFromHBAR: swapParams.isTokenFromHBAR,
          feeOnTransfer: swapParams.feeOnTransfer
        };

        console.log("Using HashPack for transaction execution...");
        
        // Execute transaction using HashPack
        const result = await realHashConnectService.executeSwapTransaction(swapTransactionParams);
        
        if (result.success) {
          console.log("HashPack transaction executed successfully:", result.txHash);
          return result;
        } else {
          throw new Error(result.error || "HashPack transaction failed");
        }

      } catch (hashPackError) {
        console.error("HashPack error:", hashPackError);
        throw new Error("HashPack wallet is required for Hedera transactions. Please ensure HashPack is installed and connected.");
      }

    } catch (error) {
      console.error("Swap execution failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Helper function to encode path for swap
  private encodePath(tokenA: string, tokenB: string): string {
    // Simple path encoding - in real implementation, this would be more complex
    return `0x${tokenA.replace(/\./g, '')}${tokenB.replace(/\./g, '')}`;
  }

  // Helper function to convert to smallest unit
  private toSmallestUnit(amount: string, decimals: number): string {
    const numAmount = parseFloat(amount);
    const smallestUnit = numAmount * Math.pow(10, decimals);
    return Math.floor(smallestUnit).toString();
  }

  // Get adapter fee from contract
  async getAdapterFee(aggregatorId: string): Promise<number> {
    try {
      // For now, return default fees
      const defaultFees: { [key: string]: number } = {
        saucerswap: 25, // 0.25%
        heliswap: 30,   // 0.30%
        pangolin: 20,   // 0.20%
      };
      
      return defaultFees[aggregatorId.toLowerCase()] || 25;
    } catch (error) {
      console.error("Error getting adapter fee:", error);
      return 25; // Default 0.25%
    }
  }

  // Get adapter address from contract
  async getAdapterAddress(aggregatorId: string): Promise<string | null> {
    try {
      const addresses = this.getContractAddresses();
      const adapterKey = aggregatorId.toLowerCase() as keyof typeof addresses;
      return addresses[adapterKey] || null;
    } catch (error) {
      console.error("Error getting adapter address:", error);
      return null;
    }
  }

  // Get contract addresses
  getContractAddresses() {
    return {
      exchange: getContractAddress("exchange"),
      saucerswap: getContractAddress("saucerswap"),
      heliswap: getContractAddress("heliswap"),
      pangolin: getContractAddress("pangolin"),
    };
  }

  // Check if contracts are deployed
  async checkContractDeployment(): Promise<boolean> {
    try {
      const addresses = this.getContractAddresses();
      const deployed = !!(addresses.exchange && addresses.saucerswap && addresses.heliswap && addresses.pangolin);
      console.log("Contract deployment check:", { addresses, deployed });
      return deployed;
    } catch (error) {
      console.error("Error checking contract deployment:", error);
      return false;
    }
  }

  // Get pool prices from service
  async getPoolPrices(): Promise<any> {
    try {
      return await poolPriceService.getAllTokenPrices();
    } catch (error) {
      console.error("Error getting pool prices:", error);
      return null;
    }
  }
}

export const hederaContractService = new HederaContractService(); 
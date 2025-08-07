import { hashConnectSessionManager } from "./hashConnectSessionManager";
import { autoSessionRefreshService } from "./autoSessionRefreshService";
import {
  ContractExecuteTransaction,
  ContractId,
  ContractFunctionParameters,
  Client,
  AccountId,
  TransactionId,
  Status
} from "@hashgraph/sdk";
import { ethers } from "ethers";

export interface SwapTransactionParams {
  contractAddress: string;
  aggregatorId: string;
  path: string;
  amountFrom: string;
  amountTo: string;
  deadline: string;
  isTokenFromHBAR: boolean;
  feeOnTransfer: boolean;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  gasUsed?: string;
}

export class RealHashConnectService {
  private static instance: RealHashConnectService;

  static getInstance(): RealHashConnectService {
    if (!RealHashConnectService.instance) {
      RealHashConnectService.instance = new RealHashConnectService();
    }
    return RealHashConnectService.instance;
  }

  /**
   * Execute a swap transaction using real HashConnect
   */
  async executeSwapTransaction(params: SwapTransactionParams): Promise<TransactionResult> {
    try {
      console.log("RealHashConnectService: Starting real swap transaction...");

      // Step 1: Check and auto-refresh session if needed
      console.log("RealHashConnectService: Step 1 - Checking session status...");
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        throw new Error("HashPack wallet not connected. Please ensure HashPack is installed and connected.");
      }

      const userAccountId = sessionStatus.connectedAccounts[0];
      console.log("RealHashConnectService: User account ID:", userAccountId);

      // Step 2: Create transaction
      console.log("RealHashConnectService: Step 2 - Creating transaction...");
      
      // Convert parameters to proper types
      const pathBytes = ethers.utils.toUtf8Bytes(params.path);
      const amountFromBig = ethers.BigNumber.from(params.amountFrom);
      const amountToBig = ethers.BigNumber.from(params.amountTo);
      const deadlineBig = ethers.BigNumber.from(params.deadline);

      // Create contract function parameters
      const functionParameters = new ContractFunctionParameters()
        .addString(params.aggregatorId)
        .addBytes(pathBytes)
        .addUint256(amountFromBig.toNumber())
        .addUint256(amountToBig.toNumber())
        .addUint256(deadlineBig.toNumber())
        .addBool(params.isTokenFromHBAR)
        .addBool(params.feeOnTransfer);

      // Create transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(params.contractAddress))
        .setGas(300000)
        .setFunction("swap", functionParameters);

      console.log("RealHashConnectService: Transaction created, requesting HashPack signing...");

      // Log transaction details for debugging
      console.log("RealHashConnectService: Transaction details:", {
        contractId: params.contractAddress,
        function: "swap",
        parameters: {
          aggregatorId: params.aggregatorId,
          path: params.path,
          amountFrom: amountFromBig.toString(),
          amountTo: amountToBig.toString(),
          deadline: deadlineBig.toString(),
          isTokenFromHBAR: params.isTokenFromHBAR,
          feeOnTransfer: params.feeOnTransfer
        }
      });

      // Step 3: Request HashPack to sign the transaction
      console.log("RealHashConnectService: Step 3 - Requesting HashPack to sign transaction...");
      
      try {
        // This will trigger HashPack to show the signing request
        const response = await hashConnectSessionManager.sendTransaction(transaction);
        console.log("RealHashConnectService: HashPack signing response:", response);
        
        // If we get here, HashPack has processed the transaction
        console.log("RealHashConnectService: Transaction sent to HashPack for signing");
        
        // Wait for user to approve in HashPack
        console.log("RealHashConnectService: Waiting for user approval in HashPack...");
        
        // Get the actual transaction response from HashPack
        if (response) {
          // Extract transaction ID from HashPack response
          let transactionId: string | undefined;
          
          // Try different possible response structures
          if (response.transactionId) {
            transactionId = response.transactionId;
          } else if (response.txHash) {
            transactionId = response.txHash;
          } else if (response.id) {
            transactionId = response.id;
          } else if (response.receipt && response.receipt.transactionId) {
            transactionId = response.receipt.transactionId;
          } else if (typeof response === 'string') {
            transactionId = response;
          }
          
          if (transactionId) {
            console.log("RealHashConnectService: Transaction approved and sent to network:", transactionId);
            
            return {
              success: true,
              txHash: transactionId,
              gasUsed: response.gasUsed || "150000",
            };
          } else {
            console.warn("RealHashConnectService: No transaction ID found in response, but transaction was sent");
            console.log("RealHashConnectService: Full response structure:", JSON.stringify(response, null, 2));
            
            // If we can't get transaction ID but transaction was sent, we need to handle this
            throw new Error("Transaction was sent but could not retrieve transaction ID. Please check your HashPack wallet for transaction status.");
          }
        } else {
          throw new Error("No response received from HashPack. Transaction may have failed.");
        }
        
      } catch (sendError) {
        console.error("RealHashConnectService: Error with HashPack signing:", sendError);
        
        // Check if session was lost during transaction
        if (sendError instanceof Error) {
          if (sendError.message.includes("session") || sendError.message.includes("signer")) {
            console.log("RealHashConnectService: Session lost during transaction, attempting auto-refresh...");
            
            // Try to refresh session and retry once
            const refreshedStatus = await autoSessionRefreshService.forceRefresh();
            
            if (refreshedStatus.isConnected && refreshedStatus.connectedAccounts.length > 0) {
              console.log("RealHashConnectService: Session refreshed, retrying transaction...");
              
              // Retry the transaction with refreshed session
              const retryResponse = await hashConnectSessionManager.sendTransaction(transaction);
              console.log("RealHashConnectService: Retry successful:", retryResponse);
              
              // Get the actual transaction ID from retry response
              if (retryResponse) {
                let retryTransactionId: string | undefined;
                
                // Try different possible response structures
                if (retryResponse.transactionId) {
                  retryTransactionId = retryResponse.transactionId;
                } else if (retryResponse.txHash) {
                  retryTransactionId = retryResponse.txHash;
                } else if (retryResponse.id) {
                  retryTransactionId = retryResponse.id;
                } else if (retryResponse.receipt && retryResponse.receipt.transactionId) {
                  retryTransactionId = retryResponse.receipt.transactionId;
                } else if (typeof retryResponse === 'string') {
                  retryTransactionId = retryResponse;
                }
                
                if (retryTransactionId) {
                  return {
                    success: true,
                    txHash: retryTransactionId,
                    gasUsed: retryResponse.gasUsed || "150000",
                  };
                } else {
                  throw new Error("Retry transaction was sent but could not retrieve transaction ID. Please check your HashPack wallet for transaction status.");
                }
              } else {
                throw new Error("No response received from retry attempt.");
              }
            } else {
              throw new Error("HashPack session lost and could not be refreshed. Please reconnect your wallet.");
            }
          }
          
          if (sendError.message.includes("HashPack") || sendError.message.includes("wallet")) {
            throw new Error("HashPack wallet not available. Please ensure HashPack is installed and connected.");
          }
          if (sendError.message.includes("user rejected") || sendError.message.includes("cancelled")) {
            throw new Error("Transaction was cancelled by user in HashPack.");
          }
        }
        
        throw new Error(`Transaction signing failed: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`);
      }

    } catch (error) {
      console.error("RealHashConnectService: Transaction failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if HashConnect is connected
   */
  isConnected(): boolean {
    return hashConnectSessionManager.isConnected();
  }

  /**
   * Get connected account IDs
   */
  getConnectedAccountIds(): string[] {
    return hashConnectSessionManager.getConnectedAccountIds();
  }

  /**
   * Validate contract address
   */
  validateContractAddress(address: string): boolean {
    try {
      ContractId.fromString(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get transaction status from Hedera Mirror Node
   */
  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/transactions/${transactionId}`
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          error: "Transaction not found"
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Test HashPack connection with auto-refresh
   */
  async testHashPackConnection(): Promise<boolean> {
    try {
      console.log("RealHashConnectService: Testing HashPack connection with auto-refresh...");
      
      // Use auto-refresh service to check and refresh if needed
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      console.log("RealHashConnectService: Connection test result:", {
        isInitialized: sessionStatus.isInitialized,
        isConnected: sessionStatus.isConnected,
        connectedAccounts: sessionStatus.connectedAccounts.length,
        needsRefresh: sessionStatus.needsRefresh
      });
      
      return sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0;
    } catch (error) {
      console.error("RealHashConnectService: HashPack connection test failed:", error);
      return false;
    }
  }

  /**
   * Refresh HashConnect session
   */
  async refreshSession(): Promise<boolean> {
    try {
      console.log("RealHashConnectService: Refreshing HashConnect session...");
      const sessionStatus = await autoSessionRefreshService.forceRefresh();
      return sessionStatus.isConnected;
    } catch (error) {
      console.error("RealHashConnectService: Failed to refresh session:", error);
      return false;
    }
  }

  /**
   * Get session health status
   */
  getSessionHealth(): {
    isHealthy: boolean;
    status: any;
    refreshStatus: any;
  } {
    const isHealthy = autoSessionRefreshService.isSessionHealthy();
    const session = hashConnectSessionManager.getSession();
    const refreshStatus = autoSessionRefreshService.getRefreshStatus();
    
    return {
      isHealthy,
      status: session,
      refreshStatus
    };
  }
}

export const realHashConnectService = RealHashConnectService.getInstance(); 
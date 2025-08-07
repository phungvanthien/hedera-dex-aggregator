import { hashConnectSessionManager } from './hashConnectSessionManager';
import { autoSessionRefreshService } from './autoSessionRefreshService';

export interface TokenAssociationResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  message?: string;
}

export interface AllowanceResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  allowance?: string;
  message?: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}

export class TokenAssociationService {
  private static instance: TokenAssociationService;

  public static getInstance(): TokenAssociationService {
    if (!TokenAssociationService.instance) {
      TokenAssociationService.instance = new TokenAssociationService();
    }
    return TokenAssociationService.instance;
  }

  /**
   * Associate a token with the connected HashPack account
   */
  async associateToken(tokenAddress: string): Promise<TokenAssociationResult> {
    try {
      console.log(`[TokenAssociation] Starting token association for: ${tokenAddress}`);

      // Check HashPack connection
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        return {
          success: false,
          error: "HashPack not connected. Please connect your wallet first."
        };
      }

      const accountId = sessionStatus.connectedAccounts[0];
      console.log(`[TokenAssociation] Connected account: ${accountId}`);

      // Import Hedera SDK
      const { 
        TokenAssociateTransaction, 
        AccountId, 
        TokenId 
      } = await import("@hashgraph/sdk");

      // Create token associate transaction
      const transaction = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenAddress)])
        .setMaxTransactionFee(2); // Set reasonable fee

      console.log(`[TokenAssociation] Created associate transaction for token: ${tokenAddress}`);

      // Send transaction via HashPack
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      
      if (!response) {
        return {
          success: false,
          error: "No response from HashPack. Association failed."
        };
      }

      // Extract transaction ID from response
      let transactionId: string | undefined;
      if (typeof response === 'string') {
        transactionId = response;
      } else if (response.transactionId) {
        transactionId = response.transactionId;
      } else if (response.txHash) {
        transactionId = response.txHash;
      } else if (response.id) {
        transactionId = response.id;
      } else if (response.receipt?.transactionId) {
        transactionId = response.receipt.transactionId;
      }

      if (!transactionId) {
        return {
          success: false,
          error: "Could not extract transaction ID from HashPack response."
        };
      }

      console.log(`[TokenAssociation] Association successful. Transaction ID: ${transactionId}`);

      return {
        success: true,
        transactionId,
        message: `Token ${tokenAddress} successfully associated with your account.`
      };

    } catch (error) {
      console.error(`[TokenAssociation] Error associating token:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during token association."
      };
    }
  }

  /**
   * Check if a token is already associated with the connected account
   */
  async isTokenAssociated(tokenAddress: string): Promise<boolean> {
    try {
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        return false;
      }

      const accountId = sessionStatus.connectedAccounts[0];

      // Query account info from Mirror Node
      const response = await fetch(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId}`
      );

      if (!response.ok) {
        console.warn(`[TokenAssociation] Failed to fetch account info: ${response.statusText}`);
        return false;
      }

      const accountData = await response.json();
      const tokens = accountData.tokens || [];

      // Check if token is in the list
      const isAssociated = tokens.some((token: any) => 
        token.token_id === tokenAddress
      );

      console.log(`[TokenAssociation] Token ${tokenAddress} associated: ${isAssociated}`);
      return isAssociated;

    } catch (error) {
      console.error(`[TokenAssociation] Error checking token association:`, error);
      return false;
    }
  }

  /**
   * Approve token allowance for the exchange contract
   */
  async approveTokenAllowance(
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string
  ): Promise<AllowanceResult> {
    try {
      console.log(`[Allowance] Starting approval for token: ${tokenAddress}, spender: ${spenderAddress}, amount: ${amount}`);

      // Check HashPack connection
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        return {
          success: false,
          error: "HashPack not connected. Please connect your wallet first."
        };
      }

      // Import Hedera SDK
      const { 
        ContractExecuteTransaction, 
        ContractId, 
        ContractFunctionParameters,
        TokenId 
      } = await import("@hashgraph/sdk");

      // Create approve transaction
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(tokenAddress))
        .setGas(100000)
        .setFunction(
          "approve",
          new ContractFunctionParameters()
            .addAddress(spenderAddress)
            .addUint256(parseInt(amount))
        );

      console.log(`[Allowance] Created approve transaction`);

      // Send transaction via HashPack
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      
      if (!response) {
        return {
          success: false,
          error: "No response from HashPack. Approval failed."
        };
      }

      // Extract transaction ID
      let transactionId: string | undefined;
      if (typeof response === 'string') {
        transactionId = response;
      } else if (response.transactionId) {
        transactionId = response.transactionId;
      } else if (response.txHash) {
        transactionId = response.txHash;
      } else if (response.id) {
        transactionId = response.id;
      } else if (response.receipt?.transactionId) {
        transactionId = response.receipt.transactionId;
      }

      if (!transactionId) {
        return {
          success: false,
          error: "Could not extract transaction ID from HashPack response."
        };
      }

      console.log(`[Allowance] Approval successful. Transaction ID: ${transactionId}`);

      return {
        success: true,
        transactionId,
        allowance: amount,
        message: `Successfully approved ${amount} tokens for spender ${spenderAddress}.`
      };

    } catch (error) {
      console.error(`[Allowance] Error approving token allowance:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during approval."
      };
    }
  }

  /**
   * Check current allowance for a token
   */
  async getTokenAllowance(
    tokenAddress: string, 
    ownerAddress: string, 
    spenderAddress: string
  ): Promise<string> {
    try {
      console.log(`[Allowance] Checking allowance for token: ${tokenAddress}`);

      // Import Hedera SDK
      const { 
        ContractCallQuery, 
        ContractId, 
        ContractFunctionParameters 
      } = await import("@hashgraph/sdk");

      // Create allowance query
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(tokenAddress))
        .setGas(100000)
        .setFunction(
          "allowance",
          new ContractFunctionParameters()
            .addAddress(ownerAddress)
            .addAddress(spenderAddress)
        );

      // Execute query
      const client = await hashConnectSessionManager.getClient();
      const response = await query.execute(client);
      
      if (!response) {
        console.warn(`[Allowance] No response from allowance query`);
        return "0";
      }

      const allowance = response.getUint256(0);
      console.log(`[Allowance] Current allowance: ${allowance}`);

      return allowance.toString();

    } catch (error) {
      console.error(`[Allowance] Error checking allowance:`, error);
      return "0";
    }
  }

  /**
   * Prepare token for swap (associate if needed, approve if needed)
   */
  async prepareTokenForSwap(
    token: TokenInfo,
    spenderAddress: string,
    amount: string
  ): Promise<{
    success: boolean;
    needsAssociation: boolean;
    needsApproval: boolean;
    associationResult?: TokenAssociationResult;
    approvalResult?: AllowanceResult;
    error?: string;
  }> {
    try {
      console.log(`[TokenPreparation] Preparing token ${token.symbol} for swap`);

      let needsAssociation = false;
      let needsApproval = false;
      let associationResult: TokenAssociationResult | undefined;
      let approvalResult: AllowanceResult | undefined;

      // Check if token is associated
      const isAssociated = await this.isTokenAssociated(token.address);
      if (!isAssociated) {
        console.log(`[TokenPreparation] Token ${token.symbol} needs association`);
        needsAssociation = true;
        
        associationResult = await this.associateToken(token.address);
        if (!associationResult.success) {
          return {
            success: false,
            needsAssociation: true,
            needsApproval: false,
            associationResult,
            error: `Failed to associate token: ${associationResult.error}`
          };
        }
      }

      // Get current allowance
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        return {
          success: false,
          needsAssociation,
          needsApproval: false,
          associationResult,
          error: "HashPack not connected"
        };
      }

      const ownerAddress = sessionStatus.connectedAccounts[0];
      const currentAllowance = await this.getTokenAllowance(token.address, ownerAddress, spenderAddress);
      
      // Check if approval is needed
      if (BigInt(currentAllowance) < BigInt(amount)) {
        console.log(`[TokenPreparation] Token ${token.symbol} needs approval. Current: ${currentAllowance}, Required: ${amount}`);
        needsApproval = true;
        
        approvalResult = await this.approveTokenAllowance(token.address, spenderAddress, amount);
        if (!approvalResult.success) {
          return {
            success: false,
            needsAssociation,
            needsApproval: true,
            associationResult,
            approvalResult,
            error: `Failed to approve token: ${approvalResult.error}`
          };
        }
      }

      console.log(`[TokenPreparation] Token ${token.symbol} prepared successfully`);
      
      return {
        success: true,
        needsAssociation,
        needsApproval,
        associationResult,
        approvalResult
      };

    } catch (error) {
      console.error(`[TokenPreparation] Error preparing token:`, error);
      return {
        success: false,
        needsAssociation: false,
        needsApproval: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during token preparation."
      };
    }
  }

  /**
   * Get supported tokens that need association/approval
   */
  getSupportedTokens(): TokenInfo[] {
    return [
      {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.3",
        decimals: 8,
        logoUrl: ""
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.456858",
        decimals: 6,
        logoUrl: ""
      },
      {
        symbol: "XSAUCE",
        name: "Sauce Token",
        address: "0.0.456858",
        decimals: 18,
        logoUrl: ""
      }
    ];
  }
}

// Export singleton instance
export const tokenAssociationService = TokenAssociationService.getInstance(); 
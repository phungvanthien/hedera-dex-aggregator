import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import { ethers } from "ethers";

export interface BroadcastTransactionParams {
  transaction: any;
  accountId: string;
  privateKey: string;
  network: 'mainnet' | 'testnet';
}

export interface BroadcastResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  receipt?: any;
}

export class TransactionBroadcastingService {
  private static instance: TransactionBroadcastingService;
  private client: Client | null = null;

  static getInstance(): TransactionBroadcastingService {
    if (!TransactionBroadcastingService.instance) {
      TransactionBroadcastingService.instance = new TransactionBroadcastingService();
    }
    return TransactionBroadcastingService.instance;
  }

  /**
   * Initialize Hedera client
   */
  private async initializeClient(network: 'mainnet' | 'testnet'): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    const networkUrl = network === 'mainnet' 
      ? 'https://mainnet.hashgraph.com'
      : 'https://testnet.hashgraph.com';

    this.client = Client.forNetwork(networkUrl as any);
    return this.client;
  }

  /**
   * Broadcast transaction to Hedera network
   */
  async broadcastTransaction(params: BroadcastTransactionParams): Promise<BroadcastResult> {
    try {
      console.log("TransactionBroadcastingService: Broadcasting transaction...");

      // Initialize client
      const client = await this.initializeClient(params.network);
      
      // Create account from private key
      const accountId = AccountId.fromString(params.accountId);
      const privateKey = PrivateKey.fromString(params.privateKey);
      
      // Set operator
      client.setOperator(accountId, privateKey);

      // Execute transaction
      console.log("TransactionBroadcastingService: Executing transaction...");
      const response = await params.transaction.execute(client);
      
      // Get receipt
      const receipt = await response.getReceipt(client);
      
      console.log("TransactionBroadcastingService: Transaction executed successfully");
      console.log("TransactionBroadcastingService: Receipt:", receipt);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        receipt: receipt
      };

    } catch (error) {
      console.error("TransactionBroadcastingService: Transaction failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string, network: 'mainnet' | 'testnet'): Promise<any> {
    try {
      const mirrorNodeUrl = network === 'mainnet'
        ? 'https://mainnet-public.mirrornode.hedera.com'
        : 'https://testnet.mirrornode.hedera.com';

      const response = await fetch(
        `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`
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
   * Get account balance
   */
  async getAccountBalance(accountId: string, network: 'mainnet' | 'testnet'): Promise<any> {
    try {
      const client = await this.initializeClient(network);
      const account = AccountId.fromString(accountId);
      const balance = await client.getAccountBalance(account);
      
      return {
        success: true,
        balance: balance.hbars.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Validate transaction before broadcasting
   */
  validateTransaction(transaction: any): boolean {
    try {
      // Check if transaction has required properties
      if (!transaction) return false;
      if (!transaction.setGas) return false;
      if (!transaction.setFunction) return false;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(transaction: any, network: 'mainnet' | 'testnet'): Promise<any> {
    try {
      const client = await this.initializeClient(network);
      
      // Get current gas price
      const gasPrice = await client.getGasPrice();
      
      // Estimate gas limit (this is a rough estimate)
      const estimatedGas = 300000; // Default gas limit for swap transactions
      
      const cost = gasPrice.multiply(estimatedGas);
      
      return {
        success: true,
        estimatedGas,
        gasPrice: gasPrice.toString(),
        cost: cost.toString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export const transactionBroadcastingService = TransactionBroadcastingService.getInstance(); 
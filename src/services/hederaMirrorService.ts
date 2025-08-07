import { TokenBalance } from '@/hooks/useTokenBalances';

// Hedera Mirror Node API endpoints
const MIRROR_NODE_BASE_URL = 'https://mainnet-public.mirrornode.hedera.com/api/v1';

// Known token addresses on Hedera Mainnet
const KNOWN_TOKENS = {
  HBAR: {
    symbol: "HBAR",
    name: "Hedera",
    address: "0.0.3", // Native HBAR
    decimals: 8,
    logoUrl: "/hedera-logo.svg",
    price: 0.05,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0.0.456858", // Real USDC address on Hedera Mainnet
    decimals: 6,
    logoUrl: "/usdc-logo.svg",
    price: 1.0,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    address: "0.0.456859", // Real USDT address on Hedera Mainnet
    decimals: 6,
    logoUrl: "/usdt-logo.svg",
    price: 1.0,
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    address: "0.0.456860", // Real WETH address on Hedera Mainnet
    decimals: 18,
    logoUrl: "/eth-logo.svg",
    price: 2000,
  }
};

export interface MirrorNodeAccount {
  account: string;
  balance: {
    balance: number;
    timestamp: string;
  };
  tokens: Array<{
    token_id: string;
    balance: number;
    name?: string;
    symbol?: string;
    decimals?: number;
  }>;
}

export class HederaMirrorService {
  private baseUrl: string;

  constructor(baseUrl: string = MIRROR_NODE_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch account details including HBAR balance and token balances
   */
  async getAccountDetails(accountId: string): Promise<MirrorNodeAccount> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account details: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching account details:', error);
      throw error;
    }
  }

  /**
   * Get HBAR balance for an account
   */
  async getHBARBalance(accountId: string): Promise<string> {
    try {
      const accountDetails = await this.getAccountDetails(accountId);
      const balance = accountDetails.balance?.balance || 0;
      
      // Convert from tinybars to HBAR (1 HBAR = 100,000,000 tinybars)
      const hbarBalance = balance / 100000000;
      return hbarBalance.toFixed(2);
    } catch (error) {
      console.error('Error fetching HBAR balance:', error);
      return "0.00";
    }
  }

  /**
   * Get token balance for a specific token
   */
  async getTokenBalance(accountId: string, tokenAddress: string): Promise<string> {
    try {
      const accountDetails = await this.getAccountDetails(accountId);
      const token = accountDetails.tokens?.find(t => t.token_id === tokenAddress);
      
      if (!token) {
        return "0.00";
      }

      const balance = token.balance || 0;
      const decimals = token.decimals || 0;
      
      // Convert from smallest unit to token units
      const tokenBalance = balance / Math.pow(10, decimals);
      return tokenBalance.toFixed(2);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return "0.00";
    }
  }

  /**
   * Get all token balances for an account
   */
  async getAllTokenBalances(accountId: string): Promise<TokenBalance[]> {
    try {
      const accountDetails = await this.getAccountDetails(accountId);
      const tokenBalances: TokenBalance[] = [];

      // Add HBAR balance
      const hbarBalance = await this.getHBARBalance(accountId);
      tokenBalances.push({
        symbol: "HBAR",
        balance: hbarBalance,
        address: "0.0.3",
        decimals: 8
      });

      // Add token balances
      for (const token of accountDetails.tokens || []) {
        const knownToken = Object.values(KNOWN_TOKENS).find(
          t => t.address === token.token_id
        );

        if (knownToken) {
          const balance = token.balance || 0;
          const decimals = token.decimals || knownToken.decimals;
          const tokenBalance = balance / Math.pow(10, decimals);

          tokenBalances.push({
            symbol: knownToken.symbol,
            balance: tokenBalance.toFixed(2),
            address: token.token_id,
            decimals: decimals
          });
        }
      }

      return tokenBalances;
    } catch (error) {
      console.error('Error fetching all token balances:', error);
      // Return HBAR balance only as fallback
      const hbarBalance = await this.getHBARBalance(accountId);
      return [{
        symbol: "HBAR",
        balance: hbarBalance,
        address: "0.0.3",
        decimals: 8
      }];
    }
  }

  /**
   * Get token info by address
   */
  async getTokenInfo(tokenAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/${tokenAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token info: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hederaMirrorService = new HederaMirrorService(); 
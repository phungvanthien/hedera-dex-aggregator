import { useState, useEffect, useContext } from 'react';
import { WalletContext } from '@/context/WalletContext';
import { hederaMirrorService } from '@/services/hederaMirrorService';

export interface TokenBalance {
  symbol: string;
  balance: string;
  address: string;
  decimals: number;
}

export function useTokenBalances() {
  const { accountId, balance, connected } = useContext(WalletContext);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real balances from Hedera Mirror Node API
  useEffect(() => {
    if (!connected || !accountId) {
      setTokenBalances([]);
      setError(null);
      return;
    }

    const fetchRealBalances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching real balances for account:', accountId);
        const realBalances = await hederaMirrorService.getAllTokenBalances(accountId);
        console.log('Real balances fetched:', realBalances);
        setTokenBalances(realBalances);
      } catch (err) {
        console.error('Error fetching real balances:', err);
        setError('Failed to fetch token balances');
        
        // Fallback to HBAR balance only
        setTokenBalances([{
          symbol: "HBAR",
          balance: balance || "0.00",
          address: "0.0.3",
          decimals: 8
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealBalances();
  }, [connected, accountId, balance]);

  const getTokenBalance = (symbol: string): string => {
    const tokenBalance = tokenBalances.find(tb => tb.symbol === symbol);
    return tokenBalance?.balance || "0.00";
  };

  const getTokenBalanceByAddress = (address: string): string => {
    const tokenBalance = tokenBalances.find(tb => tb.address === address);
    return tokenBalance?.balance || "0.00";
  };

  return {
    tokenBalances,
    getTokenBalance,
    getTokenBalanceByAddress,
    isLoading,
    error
  };
} 
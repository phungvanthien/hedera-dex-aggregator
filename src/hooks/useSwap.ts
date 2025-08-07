import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { SwapService, SwapQuote, SwapRoute, SwapResult } from '../services/swapService';

export const useSwap = () => {
  const [swapService, setSwapService] = useState<SwapService | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedTokens, setSupportedTokens] = useState<string[]>([]);

  const { address, isConnected } = useAccount();

  // Initialize swap service
  useEffect(() => {
    // For Hedera, we'll create a service without provider/signer for now
    // The actual provider/signer will be handled by the wallet context
    const service = new SwapService(null, null);
    setSwapService(service);
  }, []);

  // Load supported tokens
  useEffect(() => {
    const loadSupportedTokens = async () => {
      if (swapService) {
        try {
          const tokens = await swapService.getSupportedTokens();
          setSupportedTokens(tokens);
        } catch (err) {
          console.error('Failed to load supported tokens:', err);
        }
      }
    };

    loadSupportedTokens();
  }, [swapService]);

  // Get quote for swap
  const getQuote = useCallback(async (fromToken: string, toToken: string, amount: string) => {
    if (!swapService || !amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quoteResult = await swapService.getQuote(fromToken, toToken, amount);
      setQuote(quoteResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [swapService]);

  // Execute swap
  const executeSwap = useCallback(async (route: SwapRoute, amount: string): Promise<SwapResult> => {
    if (!swapService || !isConnected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await swapService.executeSwap(route, amount);
      
      if (result.success) {
        // Clear quote after successful swap
        setQuote(null);
      } else {
        setError(result.error || 'Swap failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Swap failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [swapService, isConnected]);

  // Get token price
  const getTokenPrice = useCallback(async (tokenAddress: string): Promise<number> => {
    if (!swapService) return 0;

    try {
      return await swapService.getTokenPrice(tokenAddress);
    } catch (err) {
      console.error('Failed to get token price:', err);
      return 0;
    }
  }, [swapService]);

  // Get adapter fee
  const getAdapterFee = useCallback(async (aggregatorId: string): Promise<number> => {
    if (!swapService) return 5; // Default 0.5%

    try {
      return await swapService.getAdapterFee(aggregatorId);
    } catch (err) {
      console.error('Failed to get adapter fee:', err);
      return 5;
    }
  }, [swapService]);

  return {
    // State
    quote,
    loading,
    error,
    supportedTokens,
    isConnected,
    address,

    // Actions
    getQuote,
    executeSwap,
    getTokenPrice,
    getAdapterFee,

    // Utilities
    clearError: () => setError(null),
    clearQuote: () => setQuote(null)
  };
}; 
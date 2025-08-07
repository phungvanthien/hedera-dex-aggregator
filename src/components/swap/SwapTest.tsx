import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { hederaContractService } from '@/services/hederaContractService';
import { gasEstimationService } from '@/services/gasEstimationService';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

interface SwapTestProps {
  className?: string;
}

export function SwapTest({ className }: SwapTestProps) {
  const [fromToken, setFromToken] = useState('HBAR');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);

  const tokens = [
    { symbol: 'HBAR', name: 'Hedera', decimals: 8 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'BTC', name: 'Bitcoin', decimals: 8 }
  ];

  const handleGetQuotes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Getting quotes for:', { fromToken, toToken, amount });

      // Get quotes
      const quotes = await hederaContractService.getQuotes(
        { symbol: fromToken, name: fromToken, address: '0x0', decimals: 8 },
        { symbol: toToken, name: toToken, address: '0x0', decimals: 6 },
        amount
      );

      console.log('Quotes received:', quotes);
      setResult({ quotes });

      // Get gas estimate for best quote
      if (quotes.length > 0) {
        const bestQuote = quotes.find(q => q.isBest) || quotes[0];
        const estimate = await gasEstimationService.estimateSwapGas(
          fromToken,
          toToken,
          amount,
          bestQuote.dex
        );
        setGasEstimate(estimate);
      }

    } catch (err) {
      console.error('Error getting quotes:', err);
      setError(err instanceof Error ? err.message : 'Failed to get quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!result?.quotes || result.quotes.length === 0) {
      setError('No quotes available. Please get quotes first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bestQuote = result.quotes.find((q: any) => q.isBest) || result.quotes[0];
      
      console.log('Executing swap with quote:', bestQuote);

      const swapResult = await hederaContractService.executeSwap(
        bestQuote,
        { symbol: fromToken, name: fromToken, address: '0x0', decimals: 8 },
        { symbol: toToken, name: toToken, address: '0x0', decimals: 6 },
        amount
      );

      console.log('Swap result:', swapResult);

      if (swapResult.success) {
        setCurrentTransactionId(swapResult.txHash || null);
        setShowTransactionMonitor(true);
        setResult({ ...result, swapResult });
      } else {
        setError(swapResult.error || 'Swap failed');
      }

    } catch (err) {
      console.error('Error executing swap:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute swap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Swap Test Component
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fromToken">From Token</Label>
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toToken">To Token</Label>
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGetQuotes}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Quotes...
              </>
            ) : (
              'Get Quotes'
            )}
          </Button>

          <Button
            onClick={handleExecuteSwap}
            disabled={isLoading || !result?.quotes || result.quotes.length === 0}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              'Execute Swap'
            )}
          </Button>
        </div>

        {/* Gas Estimation */}
        {gasEstimate && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Estimated Gas Cost:</span>
              <span className="font-semibold text-blue-900">
                {gasEstimate.estimatedCost} HBAR
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-blue-600 mt-1">
              <span>Gas Limit: {gasEstimate.gasLimit.toLocaleString()}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                gasEstimate.confidence === 'high' ? 'bg-green-100 text-green-800' :
                gasEstimate.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {gasEstimate.confidence.toUpperCase()} Confidence
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-2">
            <h4 className="font-semibold">Results:</h4>
            
            {/* Quotes */}
            {result.quotes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Quotes ({result.quotes.length}):</h5>
                <div className="space-y-1 text-sm">
                  {result.quotes.map((quote: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{quote.dex}:</span>
                      <span className="font-mono">
                        {quote.outputAmount} {toToken}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Swap Result */}
            {result.swapResult && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium mb-2 text-green-800">Swap Result:</h5>
                <div className="space-y-1 text-sm text-green-700">
                  <div>Status: {result.swapResult.success ? 'Success' : 'Failed'}</div>
                  {result.swapResult.txHash && (
                    <div>Transaction ID: {result.swapResult.txHash}</div>
                  )}
                  {result.swapResult.gasUsed && (
                    <div>Gas Used: {result.swapResult.gasUsed}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction Monitor */}
        {showTransactionMonitor && currentTransactionId && (
          <div className="mt-4">
            <TransactionMonitor 
              transactionId={currentTransactionId}
              onStatusChange={(status) => {
                if (status.status === 'success' || status.status === 'failed') {
                  setShowTransactionMonitor(false);
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
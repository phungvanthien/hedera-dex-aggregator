import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { gasEstimationService } from '@/services/gasEstimationService';
import { hederaContractService } from '@/services/hederaContractService';

interface ConfidenceTestProps {
  className?: string;
}

export function ConfidenceTest({ className }: ConfidenceTestProps) {
  const [fromToken, setFromToken] = useState('HBAR');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('10');
  const [dex, setDex] = useState('saucerswap');
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [swapResult, setSwapResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const tokens = ['HBAR', 'USDC', 'ETH', 'BTC'];
  const dexes = ['saucerswap', 'heliswap', 'pangolin'];

  const handleTestGasEstimation = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGasEstimate(null);

    try {
      console.log('Testing gas estimation for:', { fromToken, toToken, amount, dex });

      const estimate = await gasEstimationService.estimateSwapGas(
        fromToken,
        toToken,
        amount,
        dex
      );

      console.log('Gas estimate:', estimate);
      setGasEstimate(estimate);

    } catch (err) {
      console.error('Error testing gas estimation:', err);
      setError(err instanceof Error ? err.message : 'Failed to estimate gas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSwap = async () => {
    if (!gasEstimate) {
      setError('Please get gas estimate first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSwapResult(null);

    try {
      console.log('Testing swap with gas estimate:', gasEstimate);

      // Create a test quote
      const testQuote = {
        dex: dex.charAt(0).toUpperCase() + dex.slice(1),
        outputAmount: (parseFloat(amount) * 0.95).toFixed(6),
        fee: '0.3',
        priceImpact: '0.1',
        route: [fromToken, toToken],
        isBest: true
      };

      // Execute swap
      const result = await hederaContractService.executeSwap(
        testQuote,
        { symbol: fromToken, name: fromToken, address: '0x0', decimals: 8 },
        { symbol: toToken, name: toToken, address: '0x0', decimals: 6 },
        amount
      );

      console.log('Swap result:', result);
      setSwapResult(result);

    } catch (err) {
      console.error('Error testing swap:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute swap');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canSwapWithConfidence = (confidence: string) => {
    // Test if LOW confidence blocks swap
    return confidence !== 'low';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Confidence Level Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Test if LOW confidence level is blocking swap functionality
          </AlertDescription>
        </Alert>

        {/* Token Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testFromToken">From Token</Label>
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token} value={token}>
                    {token}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testToToken">To Token</Label>
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token} value={token}>
                    {token}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Amount and DEX */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testAmount">Amount</Label>
            <Input
              id="testAmount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.1"
              step="0.1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testDex">DEX</Label>
            <Select value={dex} onValueChange={setDex}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dexes.map(dexName => (
                  <SelectItem key={dexName} value={dexName}>
                    {dexName.charAt(0).toUpperCase() + dexName.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleTestGasEstimation}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Gas Estimation'
            )}
          </Button>

          <Button
            onClick={handleTestSwap}
            disabled={isLoading || !gasEstimate}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Swap'
            )}
          </Button>
        </div>

        {/* Gas Estimation Results */}
        {gasEstimate && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium mb-2 text-blue-800">Gas Estimation Results:</h5>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Gas Limit: {gasEstimate.gasLimit.toLocaleString()}</div>
              <div>Gas Price: {gasEstimate.gasPrice} tinybar</div>
              <div>Estimated Cost: {gasEstimate.estimatedCost} HBAR</div>
              <div className={`px-2 py-1 rounded text-xs inline-block ${getConfidenceColor(gasEstimate.confidence)}`}>
                Confidence: {gasEstimate.confidence.toUpperCase()}
              </div>
            </div>
            
            {/* Confidence Analysis */}
            <div className="mt-2 p-2 bg-white rounded border">
              <div className="text-xs">
                <div className="font-medium">Confidence Analysis:</div>
                <div>Can Swap: {canSwapWithConfidence(gasEstimate.confidence) ? '✅ YES' : '❌ NO'}</div>
                <div>Reason: {gasEstimate.confidence === 'low' ? 'LOW confidence may block swap' : 'Confidence level is acceptable'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Swap Results */}
        {swapResult && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="font-medium mb-2 text-green-800">Swap Test Results:</h5>
            <div className="space-y-1 text-sm text-green-700">
              <div>Status: {swapResult.success ? 'Success' : 'Failed'}</div>
              {swapResult.txHash && (
                <div>Transaction ID: {swapResult.txHash}</div>
              )}
              {swapResult.gasUsed && (
                <div>Gas Used: {swapResult.gasUsed}</div>
              )}
              {swapResult.error && (
                <div className="text-red-600">Error: {swapResult.error}</div>
              )}
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

        {/* Test Cases */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Test Cases:</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• HBAR → USDC, 1 HBAR, SaucerSwap → Should be HIGH confidence</div>
            <div>• HBAR → USDC, 1000 HBAR, SaucerSwap → Should be LOW confidence</div>
            <div>• ETH → BTC, 1 ETH, HeliSwap → Should be MEDIUM confidence</div>
            <div>• Any large amount → Should be LOW confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
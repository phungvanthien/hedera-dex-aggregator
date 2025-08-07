import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { hederaContractService } from '@/services/hederaContractService';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

interface RealTransactionTestProps {
  className?: string;
}

export function RealTransactionTest({ className }: RealTransactionTestProps) {
  const [amount, setAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);

  const handleTestSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing real swap transaction with amount:', amount);

      // Create a simple test quote
      const testQuote = {
        dex: 'saucerswap',
        outputAmount: (parseFloat(amount) * 0.95).toFixed(6), // 5% fee
        fee: '0.3',
        priceImpact: '0.1',
        route: ['HBAR', 'USDC'],
        isBest: true
      };

      // Execute swap
      const swapResult = await hederaContractService.executeSwap(
        testQuote,
        { symbol: 'HBAR', name: 'Hedera', address: '0.0.3', decimals: 8, logoUrl: '/hedera-logo.svg' },
        { symbol: 'USDC', name: 'USD Coin', address: '0.0.456858', decimals: 6, logoUrl: '/usdc-logo.svg' },
        amount
      );

      console.log('Swap result:', swapResult);

      if (swapResult.success) {
        setCurrentTransactionId(swapResult.txHash || null);
        setShowTransactionMonitor(true);
        setResult({ swapResult });
      } else {
        setError(swapResult.error || 'Swap failed');
      }

    } catch (err) {
      console.error('Error testing swap:', err);
      setError(err instanceof Error ? err.message : 'Failed to test swap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Real Transaction Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This component tests real transaction signing. Currently using simulation mode.
            Real HashConnect integration will be implemented next.
          </AlertDescription>
        </Alert>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="testAmount">Test Amount (HBAR)</Label>
          <Input
            id="testAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter test amount"
            min="0.1"
            step="0.1"
          />
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTestSwap}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Transaction...
            </>
          ) : (
            'Test Real Transaction'
          )}
        </Button>

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
            <h4 className="font-semibold">Test Results:</h4>
            
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

        {/* Implementation Status */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="font-medium mb-2 text-blue-800">Implementation Status:</h5>
          <div className="space-y-1 text-sm text-blue-700">
            <div>✅ Transaction Creation: Complete</div>
            <div>✅ Parameter Encoding: Complete</div>
            <div>✅ UI Integration: Complete</div>
            <div>⚠️ Real HashConnect Signing: In Progress</div>
            <div>⚠️ Transaction Broadcasting: Pending</div>
            <div>⚠️ Real Status Monitoring: Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, RefreshCw } from 'lucide-react';
import { realHashConnectService } from '@/services/realHashConnectService';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

export function HashPackSigningTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const testHashPackConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('HashPackSigningTest: Testing HashPack connection...');
      
      const isConnected = await realHashConnectService.testHashPackConnection();
      const connectedAccounts = realHashConnectService.getConnectedAccountIds();
      const session = hashConnectSessionManager.getSession();
      
      const connectionResult = {
        isConnected,
        connectedAccounts,
        session,
        timestamp: new Date().toISOString()
      };
      
      console.log('HashPackSigningTest: Connection test result:', connectionResult);
      setResult(connectionResult);
      setSessionInfo(session);
      
    } catch (err) {
      console.error('HashPackSigningTest: Connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('HashPackSigningTest: Refreshing HashConnect session...');
      
      const refreshed = await realHashConnectService.refreshSession();
      const session = hashConnectSessionManager.getSession();
      
      const refreshResult = {
        refreshed,
        session,
        timestamp: new Date().toISOString()
      };
      
      console.log('HashPackSigningTest: Session refresh result:', refreshResult);
      setResult(refreshResult);
      setSessionInfo(session);
      
    } catch (err) {
      console.error('HashPackSigningTest: Session refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh session');
    } finally {
      setIsLoading(false);
    }
  };

  const testTransactionSigning = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('HashPackSigningTest: Testing transaction signing...');
      
      // Test parameters for a small swap
      const testParams = {
        contractAddress: "0.0.9533134", // Exchange contract
        aggregatorId: "saucerswap",
        path: "HBAR->USDC",
        amountFrom: "100000000", // 1 HBAR in tinybars
        amountTo: "95000000", // 0.95 USDC in smallest units
        deadline: (Math.floor(Date.now() / 1000) + 1800).toString(), // 30 minutes
        isTokenFromHBAR: true,
        feeOnTransfer: false
      };

      console.log('HashPackSigningTest: Test parameters:', testParams);
      
      // This should trigger HashPack to show signing request
      const signingResult = await realHashConnectService.executeSwapTransaction(testParams);
      
      console.log('HashPackSigningTest: Signing test result:', signingResult);
      setResult(signingResult);
      
      if (signingResult.success && signingResult.txHash) {
        setCurrentTransactionId(signingResult.txHash);
        setShowTransactionMonitor(true);
      }
      
    } catch (err) {
      console.error('HashPackSigningTest: Signing test failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to test signing');
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('HashPackSigningTest: Testing simple transaction...');
      
      // Create a simple test transaction
      const testParams = {
        contractAddress: "0.0.9533134", // Exchange contract
        aggregatorId: "saucerswap",
        path: "HBAR->USDC",
        amountFrom: "10000000", // 0.1 HBAR in tinybars (smaller amount)
        amountTo: "9500000", // 0.095 USDC in smallest units
        deadline: (Math.floor(Date.now() / 1000) + 1800).toString(), // 30 minutes
        isTokenFromHBAR: true,
        feeOnTransfer: false
      };

      console.log('HashPackSigningTest: Simple transaction parameters:', testParams);
      
      const simpleResult = await realHashConnectService.executeSwapTransaction(testParams);
      
      console.log('HashPackSigningTest: Simple transaction result:', simpleResult);
      setResult(simpleResult);
      
      if (simpleResult.success && simpleResult.txHash) {
        setCurrentTransactionId(simpleResult.txHash);
        setShowTransactionMonitor(true);
      }
      
    } catch (err) {
      console.error('HashPackSigningTest: Simple transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to test simple transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          HashPack Signing Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Test HashPack wallet signing functionality. This will trigger real signing requests in HashPack.
          </AlertDescription>
        </Alert>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Button
            onClick={testHashPackConnection}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Test Connection
              </>
            )}
          </Button>

          <Button
            onClick={refreshSession}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Session
              </>
            )}
          </Button>

          <Button
            onClick={testTransactionSigning}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Test Signing
              </>
            )}
          </Button>

          <Button
            onClick={testSimpleTransaction}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Simple Transaction
              </>
            )}
          </Button>
        </div>

        {/* Session Information */}
        {sessionInfo && (
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="font-medium mb-2 text-green-800">Session Information:</h5>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <span>Initialized:</span>
                {sessionInfo.isInitialized ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Connected:</span>
                {sessionInfo.isConnected ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div>Connected Accounts: {sessionInfo.connectedAccountIds.length}</div>
              <div>Topic: {sessionInfo.topic || 'Not set'}</div>
              <div>Pairing String: {sessionInfo.pairingString ? 'Set' : 'Not set'}</div>
              <div>Encryption Key: {sessionInfo.encryptionKey ? 'Set' : 'Not set'}</div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {result && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium mb-2 text-blue-800">Test Results:</h5>
            <div className="space-y-1 text-sm text-blue-700">
              {result.isConnected !== undefined && (
                <div className="flex items-center gap-2">
                  <span>Connection Status:</span>
                  {result.isConnected ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              {result.refreshed !== undefined && (
                <div className="flex items-center gap-2">
                  <span>Session Refreshed:</span>
                  {result.refreshed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              {result.connectedAccounts && (
                <div>
                  <div>Connected Accounts: {result.connectedAccounts.length}</div>
                  {result.connectedAccounts.map((account: string, index: number) => (
                    <div key={index} className="ml-2 text-xs">
                      Account {index + 1}: {account}
                    </div>
                  ))}
                </div>
              )}
              {result.success !== undefined && (
                <div className="flex items-center gap-2">
                  <span>Transaction Success:</span>
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              {result.txHash && (
                <div>Transaction ID: {result.txHash}</div>
              )}
              {result.error && (
                <div className="text-red-600">Error: {result.error}</div>
              )}
              {result.timestamp && (
                <div className="text-xs text-gray-500">
                  Timestamp: {new Date(result.timestamp).toLocaleString()}
                </div>
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

        {/* Transaction Monitor */}
        {showTransactionMonitor && currentTransactionId && (
          <div className="mt-4">
            <TransactionMonitor 
              transactionId={currentTransactionId}
              onStatusChange={(status) => {
                console.log('HashPackSigningTest: Transaction status changed:', status);
              }}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Instructions:</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>1. <strong>Test Connection</strong> - Check if HashPack is connected</div>
            <div>2. <strong>Refresh Session</strong> - Refresh HashConnect session if needed</div>
            <div>3. <strong>Test Signing</strong> - Trigger a signing request in HashPack (1 HBAR)</div>
            <div>4. <strong>Simple Transaction</strong> - Test with smaller amount (0.1 HBAR)</div>
            <div>5. Check HashPack extension for signing requests</div>
            <div>6. Monitor transaction status in real-time</div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h5 className="font-medium mb-2 text-yellow-800">Debug Information:</h5>
          <div className="space-y-1 text-xs text-yellow-700">
            <div>• HashPack should show signing request when you click "Test Signing"</div>
            <div>• If no signing request appears, try "Refresh Session" first</div>
            <div>• Check browser console for detailed logs</div>
            <div>• Transaction will be sent to Hedera mainnet</div>
            <div>• Gas cost: ~0.0015 HBAR per transaction</div>
            <div>• Session must be properly initialized for signing to work</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
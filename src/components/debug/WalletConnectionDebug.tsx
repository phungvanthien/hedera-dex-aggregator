import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { hc } from '@/hooks/walletConnect';
import { hashConnectService } from '@/services/hashConnectService';
import { transactionBroadcastingService } from '@/services/transactionBroadcastingService';

interface WalletConnectionDebugProps {
  className?: string;
}

export function WalletConnectionDebug({ className }: WalletConnectionDebugProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('WalletConnectionDebug: Checking connection status...');

      const status = {
        isConnected: hashConnectService.isConnected(),
        connectedAccounts: hashConnectService.getConnectedAccountIds(),
        hashConnectState: {
          connectedAccountIds: hc.connectedAccountIds,
          topic: hc.topic,
          pairingString: hc.pairingString,
          encryptionKey: hc.encryptionKey
        }
      };

      console.log('WalletConnectionDebug: Connection status:', status);
      setConnectionStatus(status);

    } catch (err) {
      console.error('WalletConnectionDebug: Error checking connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to check connection');
    } finally {
      setIsLoading(false);
    }
  };

  const testTransactionCreation = async () => {
    if (!connectionStatus?.isConnected) {
      setError('Wallet not connected. Please connect HashPack first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('WalletConnectionDebug: Testing transaction creation...');

      // Create a simple test transaction
      const testParams = {
        contractAddress: "0.0.9533134", // Exchange contract
        aggregatorId: "saucerswap",
        path: "HBAR->USDC",
        amountFrom: "100000000", // 1 HBAR in tinybars
        amountTo: "95000000", // 0.95 USDC in smallest units
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        isTokenFromHBAR: true,
        feeOnTransfer: false
      };

      console.log('WalletConnectionDebug: Test parameters:', testParams);

      const result = await hashConnectService.executeSwapTransaction(testParams);

      console.log('WalletConnectionDebug: Transaction test result:', result);
      setTestResults(result);

    } catch (err) {
      console.error('WalletConnectionDebug: Error testing transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to test transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const testNetworkConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('WalletConnectionDebug: Testing network connection...');

      // Test mainnet connection
      const mainnetStatus = await transactionBroadcastingService.getTransactionStatus(
        "0.0.1234567-1234567890-123456789",
        'mainnet'
      );

      console.log('WalletConnectionDebug: Mainnet test result:', mainnetStatus);

      setTestResults({
        networkTest: {
          mainnet: mainnetStatus,
          timestamp: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error('WalletConnectionDebug: Error testing network:', err);
      setError(err instanceof Error ? err.message : 'Failed to test network');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Wallet Connection Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Debug HashPack wallet connection and transaction capabilities
          </AlertDescription>
        </Alert>

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <Button
              onClick={checkConnectionStatus}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {connectionStatus && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span>Connected:</span>
                  {connectionStatus.isConnected ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div>Connected Accounts: {connectionStatus.connectedAccounts.length}</div>
                {connectionStatus.connectedAccounts.length > 0 && (
                  <div className="text-xs text-gray-600">
                    {connectionStatus.connectedAccounts.map((account: string, index: number) => (
                      <div key={index}>Account {index + 1}: {account}</div>
                    ))}
                  </div>
                )}
                <div>Topic: {connectionStatus.hashConnectState.topic || 'Not set'}</div>
                <div>Pairing String: {connectionStatus.hashConnectState.pairingString ? 'Set' : 'Not set'}</div>
                <div>Encryption Key: {connectionStatus.hashConnectState.encryptionKey ? 'Set' : 'Not set'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={testTransactionCreation}
            disabled={isLoading || !connectionStatus?.isConnected}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Transaction Creation'
            )}
          </Button>

          <Button
            onClick={testNetworkConnection}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Network Connection'
            )}
          </Button>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium mb-2 text-blue-800">Test Results:</h5>
            <div className="space-y-1 text-sm text-blue-700">
              {testResults.success !== undefined && (
                <div>Transaction Success: {testResults.success ? 'Yes' : 'No'}</div>
              )}
              {testResults.txHash && (
                <div>Transaction ID: {testResults.txHash}</div>
              )}
              {testResults.error && (
                <div className="text-red-600">Error: {testResults.error}</div>
              )}
              {testResults.networkTest && (
                <div>
                  <div>Network Test:</div>
                  <div className="ml-2 text-xs">
                    <div>Mainnet: {testResults.networkTest.mainnet.success ? 'Connected' : 'Failed'}</div>
                    <div>Timestamp: {testResults.networkTest.timestamp}</div>
                  </div>
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

        {/* Debug Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="font-medium mb-2">Debug Information:</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• HashConnect Version: Check package.json</div>
            <div>• Hedera SDK Version: Check package.json</div>
            <div>• Network: Mainnet</div>
            <div>• Contract Address: 0.0.9533134</div>
            <div>• Adapter Addresses: SaucerSwap, HeliSwap, Pangolin</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
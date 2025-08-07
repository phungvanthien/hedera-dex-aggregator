import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, RefreshCw, Zap } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';

export function SessionStatusFix() {
  const [isFixing, setIsFixing] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [fixResults, setFixResults] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addResult = (result: string) => {
    setFixResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const checkCurrentStatus = () => {
    const session = hashConnectSessionManager.getSession();
    const connected = hashConnectSessionManager.isConnected();
    const ready = hashConnectSessionManager.isSessionReady();
    
    setSessionStatus(session);
    setIsConnected(connected);
    
    addResult(`📊 Current Status Check:`);
    addResult(`   - Initialized: ${session.isInitialized ? '✅' : '❌'}`);
    addResult(`   - Connected: ${connected ? '✅' : '❌'}`);
    addResult(`   - Session Ready: ${ready ? '✅' : '❌'}`);
    addResult(`   - Topic: ${session.topic ? '✅' : '❌'}`);
    addResult(`   - EncryptionKey: ${session.encryptionKey ? '✅' : '❌'}`);
    addResult(`   - Accounts: ${session.connectedAccountIds.length}`);
  };

  const forceSessionRefresh = async () => {
    setIsFixing(true);
    setFixResults([]);
    
    addResult("🔄 Starting Force Session Refresh...");

    try {
      // Step 1: Check current status
      addResult("📊 Step 1: Checking current status...");
      checkCurrentStatus();

      // Step 2: Force refresh session
      addResult("🔄 Step 2: Force refreshing session...");
      const refreshResult = await autoSessionRefreshService.forceRefresh();
      addResult(`📊 Refresh result: ${refreshResult.isConnected ? '✅ Connected' : '❌ Failed'}`);

      // Step 3: Update session status
      addResult("📊 Step 3: Updating session status...");
      const session = hashConnectSessionManager.getSession();
      const connected = hashConnectSessionManager.isConnected();
      const ready = hashConnectSessionManager.isSessionReady();
      
      setSessionStatus(session);
      setIsConnected(connected);
      
      addResult(`📊 Updated Status:`);
      addResult(`   - Connected: ${connected ? '✅' : '❌'}`);
      addResult(`   - Session Ready: ${ready ? '✅' : '❌'}`);
      addResult(`   - Topic: ${session.topic ? '✅' : '❌'}`);
      addResult(`   - EncryptionKey: ${session.encryptionKey ? '✅' : '❌'}`);
      addResult(`   - Accounts: ${session.connectedAccountIds.join(', ') || 'None'}`);

      // Step 4: Test transaction if ready
      if (ready) {
        addResult("📝 Step 4: Testing transaction signing...");
        try {
          const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
          
          const testTransaction = new ContractExecuteTransaction()
            .setContractId(ContractId.fromString("0.0.9533134"))
            .setGas(100000)
            .setFunction("name", new ContractFunctionParameters());

          addResult("📱 Sending test transaction to HashPack...");
          const response = await hashConnectSessionManager.sendTransaction(testTransaction);
          addResult(`✅ Transaction test successful: ${JSON.stringify(response)}`);
        } catch (txError) {
          addResult(`❌ Transaction test failed: ${txError}`);
        }
      } else {
        addResult("⚠️ Session not ready - skipping transaction test");
      }

      addResult("✅ Force session refresh completed!");

    } catch (error) {
      addResult(`❌ Force refresh failed: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const clearExistingPairing = async () => {
    setIsFixing(true);
    setFixResults([]);
    
    addResult("🗑️ Clearing existing pairing...");

    try {
      // Disconnect current session
      await hashConnectSessionManager.disconnect();
      addResult("✅ Disconnected from HashPack");

      // Clear session data
      setSessionStatus(null);
      setIsConnected(false);
      addResult("✅ Cleared session data");

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      addResult("⏳ Waited 2 seconds");

      // Try to reconnect
      addResult("🔄 Attempting to reconnect...");
      const connected = await hashConnectSessionManager.connectToLocalWallet();
      addResult(`📊 Reconnection result: ${connected ? '✅ Success' : '❌ Failed'}`);

      // Check final status
      checkCurrentStatus();

    } catch (error) {
      addResult(`❌ Clear pairing failed: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const testSwapFlow = async () => {
    if (!hashConnectSessionManager.isSessionReady()) {
      addResult("❌ Cannot test swap - session not ready");
      return;
    }

    setIsFixing(true);
    addResult("🔄 Testing swap flow...");

    try {
      // Import hederaContractService
      const { hederaContractService } = await import('@/services/hederaContractService');
      
      // Create test data
      const testQuote = {
        dex: "SaucerSwap",
        outputAmount: "100",
        priceImpact: "0.5",
        fee: "0.25",
        route: ["SaucerSwap"],
        isBest: true
      };

      const testFromToken = {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.3",
        decimals: 8,
        logoUrl: "/hedera-logo.svg",
        price: 0.0523
      };

      const testToToken = {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.456858",
        decimals: 6,
        logoUrl: "/usdc-logo.svg",
        price: 1.0000
      };

      addResult("📊 Executing test swap...");
      
      const result = await hederaContractService.executeSwap(
        testQuote,
        testFromToken,
        testToToken,
        "1", // 1 HBAR (small amount for testing)
        0.5
      );

      if (result.success) {
        addResult(`🎉 Swap test successful! TX: ${result.txHash}`);
      } else {
        addResult(`❌ Swap test failed: ${result.error}`);
      }

    } catch (error) {
      addResult(`❌ Swap test error: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  // Auto-check status on mount
  useEffect(() => {
    checkCurrentStatus();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Session Status Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Current Session Status</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div>Connected: {isConnected ? "✅ Yes" : "❌ No"}</div>
            <div>Session Ready: {hashConnectSessionManager.isSessionReady() ? "✅ Yes" : "❌ No"}</div>
            {sessionStatus && (
              <>
                <div>Topic: {sessionStatus.topic ? "✅ Present" : "❌ Missing"}</div>
                <div>Encryption Key: {sessionStatus.encryptionKey ? "✅ Present" : "❌ Missing"}</div>
                <div>Accounts: {sessionStatus.connectedAccountIds.join(", ") || "None"}</div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={forceSessionRefresh}
            disabled={isFixing}
            className="bg-green-500 hover:bg-green-600"
          >
            {isFixing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Force Session Refresh
          </Button>

          <Button
            onClick={clearExistingPairing}
            disabled={isFixing}
            variant="outline"
            className="border-red-500 text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Clear Pairing
          </Button>

          <Button
            onClick={checkCurrentStatus}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Check Status
          </Button>

          <Button
            onClick={testSwapFlow}
            disabled={isFixing || !hashConnectSessionManager.isSessionReady()}
            variant="outline"
            className="border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Swap Flow
          </Button>
        </div>

        {/* Fix Results */}
        {fixResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Fix Results</h4>
            <div className="max-h-60 overflow-y-auto space-y-1 bg-gray-50 p-3 rounded-lg">
              {fixResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool fixes session status issues after HashPack pairing.
            <br />• Click "Force Session Refresh" to update session status
            <br />• Use "Clear Pairing" if you need to start fresh
            <br />• "Test Swap Flow" will test the complete swap process
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
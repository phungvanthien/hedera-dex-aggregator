import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Wallet, Zap } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';

export function HashPackConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [sessionStatus, setSessionStatus] = useState<any>(null);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testHashPackInitialization = async () => {
    setIsLoading(true);
    addResult("🔍 Testing HashPack initialization...");

    try {
      const initialized = await hashConnectSessionManager.initialize();
      
      if (initialized) {
        addResult("✅ HashPack initialized successfully");
        return true;
      } else {
        addResult("❌ HashPack initialization failed");
        return false;
      }
    } catch (error) {
      addResult(`❌ HashPack initialization error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testHashPackConnection = async () => {
    setIsLoading(true);
    addResult("🔍 Testing HashPack connection...");

    try {
      const connected = await hashConnectSessionManager.connectToLocalWallet();
      
      if (connected) {
        addResult("✅ HashPack connected successfully");
        return true;
      } else {
        addResult("❌ HashPack connection failed");
        return false;
      }
    } catch (error) {
      addResult(`❌ HashPack connection error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testSessionStatus = async () => {
    setIsLoading(true);
    addResult("🔍 Testing session status...");

    try {
      const status = await autoSessionRefreshService.checkAndRefreshSession();
      setSessionStatus(status);
      
      if (status.isConnected && status.connectedAccounts.length > 0) {
        addResult("✅ Session is healthy");
        addResult(`📱 Connected account: ${status.connectedAccounts[0]}`);
        return true;
      } else {
        addResult("❌ Session is not healthy");
        addResult(`📊 Status: ${JSON.stringify(status)}`);
        return false;
      }
    } catch (error) {
      addResult(`❌ Session status error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleTransaction = async () => {
    setIsLoading(true);
    addResult("🚀 Testing simple transaction (this should trigger HashPack popup)...");

    try {
      // First, ensure we have a full session
      addResult("🔍 Checking session readiness...");
      const session = hashConnectSessionManager.getSession();
      
      addResult(`📊 Session details: Topic=${session.topic ? '✅' : '❌'}, EncryptionKey=${session.encryptionKey ? '✅' : '❌'}`);
      
      if (!hashConnectSessionManager.isSessionReady()) {
        addResult("⚠️ Session not ready, attempting to establish full session...");
        addResult("🔄 This may take a few seconds and require user interaction...");
        
        const established = await hashConnectSessionManager.forceEstablishSession();
        if (!established) {
          addResult("❌ Could not establish full session for transaction");
          addResult("💡 Try manually connecting HashPack first, then run this test again");
          return false;
        }
        addResult("✅ Full session established");
      }

      // Create a simple test transaction
      const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString("0.0.9533134")) // Exchange contract
        .setGas(100000)
        .setFunction("name", new ContractFunctionParameters());

      addResult("📝 Transaction created, requesting HashPack signing...");
      addResult("📱 HashPack popup should appear now - please approve the transaction");
      
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      addResult(`✅ Transaction sent to HashPack: ${JSON.stringify(response)}`);
      
      return true;
    } catch (error) {
      addResult(`❌ Transaction error: ${error}`);
      
      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes("session")) {
          addResult("💡 Session issue detected. Try:");
          addResult("   1. Refresh the page");
          addResult("   2. Reconnect HashPack");
          addResult("   3. Run the test again");
        } else if (error.message.includes("user rejected")) {
          addResult("ℹ️ Transaction was cancelled by user - this is normal for testing");
        } else if (error.message.includes("HashPack")) {
          addResult("💡 HashPack not available. Ensure:");
          addResult("   1. HashPack extension is installed");
          addResult("   2. HashPack is unlocked");
          addResult("   3. You're connected to the same account");
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    addResult("🧪 Starting HashPack connection test...");

    try {
      // Step 1: Initialize HashPack
      const initialized = await testHashPackInitialization();
      if (!initialized) {
        addResult("❌ Test stopped: HashPack not initialized");
        return;
      }

      // Step 2: Check session status
      const sessionHealthy = await testSessionStatus();
      if (!sessionHealthy) {
        addResult("❌ Test stopped: Session not healthy");
        return;
      }

      // Step 3: Test simple transaction (should trigger popup)
      const transactionSuccess = await testSimpleTransaction();
      if (transactionSuccess) {
        addResult("🎉 Full test completed! HashPack popup should have appeared.");
      } else {
        addResult("❌ Test failed at transaction step");
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setSessionStatus(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          HashPack Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runFullTest}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Full Test
          </Button>

          <Button
            onClick={testHashPackInitialization}
            disabled={isLoading}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Test Init
          </Button>

          <Button
            onClick={testHashPackConnection}
            disabled={isLoading}
            variant="outline"
            className="border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Test Connect
          </Button>

          <Button
            onClick={testSessionStatus}
            disabled={isLoading}
            variant="outline"
            className="border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Test Session
          </Button>

          <Button
            onClick={testSimpleTransaction}
            disabled={isLoading}
            variant="outline"
            className="border-red-500 text-red-700 hover:bg-red-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Transaction
          </Button>

          <Button
            onClick={clearResults}
            variant="outline"
            className="border-gray-500 text-gray-700 hover:bg-gray-50"
          >
            Clear Results
          </Button>
        </div>

        {/* Session Status */}
        {sessionStatus && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Session Status</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Initialized: {sessionStatus.isInitialized ? "✅ Yes" : "❌ No"}</div>
              <div>Connected: {sessionStatus.isConnected ? "✅ Yes" : "❌ No"}</div>
              <div>Accounts: {sessionStatus.connectedAccounts.length}</div>
              <div>Needs Refresh: {sessionStatus.needsRefresh ? "⚠️ Yes" : "✅ No"}</div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Test Results</h4>
            <div className="max-h-60 overflow-y-auto space-y-1 bg-gray-50 p-3 rounded-lg">
              {testResults.map((result, index) => (
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
            This test will check HashPack connection and attempt to trigger a signing popup.
            <br />• Make sure HashPack extension is installed
            <br />• The "Test Transaction" button should trigger a HashPack popup
            <br />• If no popup appears, HashPack may not be properly connected
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
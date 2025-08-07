import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, RefreshCw, Zap, Info } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';

export function HashPackStatusTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [refreshStatus, setRefreshStatus] = useState<any>(null);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setSessionStatus(null);
    setRefreshStatus(null);
  };

  const checkHashPackStatus = async () => {
    setIsLoading(true);
    addResult("🔍 Checking HashPack status...");

    try {
      // Check HashConnect Session Manager
      const hashConnect = hashConnectSessionManager.getHashConnect();
      const session = hashConnectSessionManager.getSession();
      const isInitialized = hashConnectSessionManager.isInitialized();
      const isConnected = hashConnectSessionManager.isConnected();
      const connectedAccounts = hashConnectSessionManager.getConnectedAccountIds();

      addResult(`📊 HashConnect instance: ${hashConnect ? '✅ Available' : '❌ Not available'}`);
      addResult(`📊 Initialized: ${isInitialized ? '✅ Yes' : '❌ No'}`);
      addResult(`📊 Connected: ${isConnected ? '✅ Yes' : '❌ No'}`);
      addResult(`📊 Connected accounts: ${connectedAccounts.length}`);
      addResult(`📊 Session topic: ${session.topic || 'None'}`);
      addResult(`📊 Session encryption key: ${session.encryptionKey ? '✅ Available' : '❌ Not available'}`);

      setSessionStatus({
        hashConnect: !!hashConnect,
        isInitialized,
        isConnected,
        connectedAccounts: connectedAccounts.length,
        topic: session.topic,
        encryptionKey: !!session.encryptionKey
      });

      // Check Auto Session Refresh Service
      const refreshStatus = autoSessionRefreshService.getRefreshStatus();
      addResult(`📊 Refresh attempts: ${refreshStatus.attempts}/${refreshStatus.maxAttempts}`);
      addResult(`📊 Is refreshing: ${refreshStatus.isRefreshing ? 'Yes' : 'No'}`);
      addResult(`📊 Cooldown remaining: ${refreshStatus.cooldownRemaining}ms`);

      setRefreshStatus(refreshStatus);

    } catch (error) {
      addResult(`❌ Error checking status: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testInitialization = async () => {
    setIsLoading(true);
    addResult("🚀 Testing HashPack initialization...");

    try {
      const initialized = await hashConnectSessionManager.initialize();
      addResult(`📊 Initialization result: ${initialized ? '✅ Success' : '❌ Failed'}`);

      if (initialized) {
        addResult("✅ HashPack initialized successfully");
        await checkHashPackStatus();
      } else {
        addResult("❌ HashPack initialization failed");
      }

    } catch (error) {
      addResult(`❌ Error during initialization: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    addResult("🔗 Testing HashPack connection...");

    try {
      const connected = await hashConnectSessionManager.connectToLocalWallet();
      addResult(`📊 Connection result: ${connected ? '✅ Success' : '❌ Failed'}`);

      if (connected) {
        addResult("✅ HashPack connected successfully");
        await checkHashPackStatus();
      } else {
        addResult("❌ HashPack connection failed");
        addResult("💡 Make sure HashPack extension is installed and unlocked");
      }

    } catch (error) {
      addResult(`❌ Error during connection: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAutoRefresh = async () => {
    setIsLoading(true);
    addResult("🔄 Testing auto session refresh...");

    try {
      const status = await autoSessionRefreshService.checkAndRefreshSession();
      addResult(`📊 Auto refresh result:`);
      addResult(`  - Initialized: ${status.isInitialized ? '✅ Yes' : '❌ No'}`);
      addResult(`  - Connected: ${status.isConnected ? '✅ Yes' : '❌ No'}`);
      addResult(`  - Connected accounts: ${status.connectedAccounts.length}`);
      addResult(`  - Needs refresh: ${status.needsRefresh ? 'Yes' : 'No'}`);

      await checkHashPackStatus();

    } catch (error) {
      addResult(`❌ Error during auto refresh: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const forceRefresh = async () => {
    setIsLoading(true);
    addResult("⚡ Force refreshing session...");

    try {
      const status = await autoSessionRefreshService.forceRefresh();
      addResult(`📊 Force refresh result:`);
      addResult(`  - Initialized: ${status.isInitialized ? '✅ Yes' : '❌ No'}`);
      addResult(`  - Connected: ${status.isConnected ? '✅ Yes' : '❌ No'}`);
      addResult(`  - Connected accounts: ${status.connectedAccounts.length}`);

      await checkHashPackStatus();

    } catch (error) {
      addResult(`❌ Error during force refresh: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const forceEstablishSession = async () => {
    setIsLoading(true);
    addResult("🔐 Force establishing session...");

    try {
      const established = await hashConnectSessionManager.forceEstablishSession();
      addResult(`📊 Force establish session result: ${established ? '✅ Success' : '❌ Failed'}`);

      if (established) {
        addResult("✅ Session established successfully!");
        addResult("🔑 Topic and encryption key should now be available");
      } else {
        addResult("❌ Failed to establish session");
        addResult("💡 Try opening HashPack extension and approving the connection");
      }

      await checkHashPackStatus();

    } catch (error) {
      addResult(`❌ Error during force establish session: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const emergencyReset = () => {
    addResult("🚨 Emergency reset triggered...");
    autoSessionRefreshService.emergencyReset();
    addResult("✅ Emergency reset completed");
    checkHashPackStatus();
  };

  const testSimpleTransaction = async () => {
    setIsLoading(true);
    addResult("📝 Testing simple transaction...");

    try {
      // Create a simple test transaction
      const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString("0.0.9533134")) // Exchange contract
        .setGas(100000)
        .setFunction("name", new ContractFunctionParameters());

      addResult("📝 Transaction created, attempting to send...");
      
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      addResult(`✅ Transaction response: ${JSON.stringify(response)}`);
      
    } catch (error) {
      addResult(`❌ Transaction error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };



  // Auto-check status on component mount
  useEffect(() => {
    checkHashPackStatus();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          HashPack Status Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {sessionStatus && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h5 className="font-semibold">HashPack Status:</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant={sessionStatus.hashConnect ? "default" : "destructive"}>
                HashConnect: {sessionStatus.hashConnect ? "Available" : "Not Available"}
              </Badge>
              <Badge variant={sessionStatus.isInitialized ? "default" : "destructive"}>
                Initialized: {sessionStatus.isInitialized ? "Yes" : "No"}
              </Badge>
              <Badge variant={sessionStatus.isConnected ? "default" : "destructive"}>
                Connected: {sessionStatus.isConnected ? "Yes" : "No"}
              </Badge>
              <Badge variant="outline">
                Accounts: {sessionStatus.connectedAccounts}
              </Badge>
              <Badge variant={sessionStatus.topic ? "default" : "destructive"}>
                Topic: {sessionStatus.topic ? "Set" : "None"}
              </Badge>
              <Badge variant={sessionStatus.encryptionKey ? "default" : "destructive"}>
                Encryption: {sessionStatus.encryptionKey ? "Set" : "None"}
              </Badge>
            </div>
          </div>
        )}

        {refreshStatus && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h5 className="font-semibold">Refresh Status:</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Attempts: {refreshStatus.attempts}/{refreshStatus.maxAttempts}
              </Badge>
              <Badge variant={refreshStatus.isRefreshing ? "destructive" : "default"}>
                Refreshing: {refreshStatus.isRefreshing ? "Yes" : "No"}
              </Badge>
              <Badge variant="outline">
                Cooldown: {Math.max(0, refreshStatus.cooldownRemaining)}ms
              </Badge>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="space-y-2">
          <h4 className="font-semibold">Test Actions:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={checkHashPackStatus}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>

            <Button
              onClick={testInitialization}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Init
            </Button>

            <Button
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Test Connect
            </Button>

            <Button
              onClick={testAutoRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-purple-500 text-purple-700 hover:bg-purple-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto Refresh
            </Button>

            <Button
              onClick={forceRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-700 hover:bg-orange-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Force Refresh
            </Button>

            <Button
              onClick={emergencyReset}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Reset
            </Button>

            <Button
              onClick={testSimpleTransaction}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Info className="h-4 w-4 mr-2" />
              )}
              Test Transaction
            </Button>

            <Button
              onClick={forceEstablishSession}
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-600"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Force Establish Session
            </Button>
          </div>
        </div>

        {/* Clear Results */}
        <Button
          onClick={clearResults}
          variant="outline"
          size="sm"
          className="border-gray-500 text-gray-700 hover:bg-gray-50"
        >
          Clear Results
        </Button>

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
          <Info className="h-4 w-4" />
          <AlertDescription>
            This test helps debug HashPack connection issues:
            <br />• <strong>Check Status:</strong> View current HashPack state
            <br />• <strong>Test Init:</strong> Initialize HashConnect
            <br />• <strong>Test Connect:</strong> Connect to local wallet
            <br />• <strong>Auto Refresh:</strong> Test automatic session refresh
            <br />• <strong>Force Refresh:</strong> Force session refresh
            <br />• <strong>Emergency Reset:</strong> Reset all session state
            <br />• <strong>Test Transaction:</strong> Test simple transaction
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
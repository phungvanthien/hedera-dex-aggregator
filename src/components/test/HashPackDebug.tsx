import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, RefreshCw, AlertTriangle } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';

export function HashPackDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const checkSession = () => {
    const session = hashConnectSessionManager.getSession();
    setSessionInfo(session);
    addResult(`📊 Session Status: ${JSON.stringify(session, null, 2)}`);
  };

  const testInit = async () => {
    setIsLoading(true);
    addResult("🔍 Testing HashPack initialization...");
    
    try {
      const result = await hashConnectSessionManager.initialize();
      addResult(`✅ Init result: ${result}`);
      checkSession();
    } catch (error) {
      addResult(`❌ Init error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnect = async () => {
    setIsLoading(true);
    addResult("🔗 Testing HashPack connection...");
    
    try {
      const result = await hashConnectSessionManager.connectToLocalWallet();
      addResult(`✅ Connect result: ${result}`);
      checkSession();
    } catch (error) {
      addResult(`❌ Connect error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testForceSession = async () => {
    setIsLoading(true);
    addResult("🚀 Testing force session establishment...");
    
    try {
      const result = await hashConnectSessionManager.forceEstablishSession();
      addResult(`✅ Force session result: ${result}`);
      checkSession();
    } catch (error) {
      addResult(`❌ Force session error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTransaction = async () => {
    setIsLoading(true);
    addResult("📝 Testing transaction...");
    
    try {
      const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString("0.0.9533134"))
        .setGas(100000)
        .setFunction("name", new ContractFunctionParameters());

      addResult("📝 Transaction created, sending...");
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      addResult(`✅ Transaction response: ${JSON.stringify(response)}`);
    } catch (error) {
      addResult(`❌ Transaction error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setSessionInfo(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          HashPack Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testInit} disabled={isLoading} variant="outline" size="sm">
            <Loader2 className="h-4 w-4 mr-2" />
            Test Init
          </Button>
          <Button onClick={testConnect} disabled={isLoading} variant="outline" size="sm">
            <Wallet className="h-4 w-4 mr-2" />
            Test Connect
          </Button>
          <Button onClick={testForceSession} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Session
          </Button>
          <Button onClick={testTransaction} disabled={isLoading} variant="outline" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Test Transaction
          </Button>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear
          </Button>
        </div>

        {sessionInfo && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h5 className="font-semibold mb-2">Session Info:</h5>
            <div className="space-y-1 text-sm">
              <div><Badge variant={sessionInfo.isInitialized ? "default" : "destructive"}>
                Initialized: {sessionInfo.isInitialized ? "Yes" : "No"}
              </Badge></div>
              <div><Badge variant={sessionInfo.isConnected ? "default" : "destructive"}>
                Connected: {sessionInfo.isConnected ? "Yes" : "No"}
              </Badge></div>
              <div><Badge variant={sessionInfo.topic ? "default" : "destructive"}>
                Topic: {sessionInfo.topic || "None"}
              </Badge></div>
              <div><Badge variant={sessionInfo.encryptionKey ? "default" : "destructive"}>
                Encryption: {sessionInfo.encryptionKey ? "Yes" : "No"}
              </Badge></div>
              <div>Accounts: {sessionInfo.connectedAccountIds.join(", ") || "None"}</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-1 bg-gray-50 p-3 rounded-lg">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">{result}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
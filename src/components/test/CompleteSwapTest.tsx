import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Zap, Wallet, ArrowRight } from 'lucide-react';
import { hederaContractService } from '@/services/hederaContractService';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

export function CompleteSwapTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);
  const [step, setStep] = useState<'idle' | 'preparing' | 'modal' | 'signing' | 'complete'>('idle');

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testCompleteSwapFlow = async () => {
    setIsLoading(true);
    setTestResults([]);
    setStep('preparing');
    addResult("🧪 Starting complete swap flow test...");

    try {
      // Step 1: Check HashPack connection
      addResult("🔍 Step 1: Checking HashPack connection...");
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        addResult("❌ HashPack not connected. Please connect HashPack first.");
        setStep('idle');
        return;
      }
      
      addResult(`✅ HashPack connected: ${sessionStatus.connectedAccounts[0]}`);

      // Step 2: Create test quote
      addResult("🔍 Step 2: Creating test quote...");
      const fromToken = {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.3",
        decimals: 8,
        logoUrl: ""
      };

      const toToken = {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.456858",
        decimals: 6,
        logoUrl: ""
      };

      const quotes = await hederaContractService.getQuotes(fromToken, toToken, "0.1");
      
      if (!quotes || quotes.length === 0) {
        addResult("❌ No quotes available. Cannot proceed with swap.");
        setStep('idle');
        return;
      }

      const bestQuote = quotes[0];
      addResult(`✅ Quote created: ${bestQuote.dex} - ${bestQuote.outputAmount} USDC`);

      // Step 3: Simulate modal confirmation
      addResult("🔍 Step 3: Simulating modal confirmation...");
      setStep('modal');
      addResult("📋 Modal would show here with swap details");
      addResult("📋 User would click 'Confirm Swap'");

      // Step 4: Execute swap (this should trigger HashPack popup)
      addResult("🔍 Step 4: Executing swap (should trigger HashPack popup)...");
      setStep('signing');
      
      const result = await hederaContractService.executeSwap(
        bestQuote,
        fromToken,
        toToken,
        "0.1",
        0.5
      );

      if (result.success) {
        addResult(`✅ Swap executed successfully!`);
        addResult(`🔗 Transaction ID: ${result.txHash}`);
        setCurrentTransactionId(result.txHash || null);
        setShowTransactionMonitor(true);
        setStep('complete');
      } else {
        addResult(`❌ Swap failed: ${result.error}`);
        setStep('idle');
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`);
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const testHashPackSigningOnly = async () => {
    setIsLoading(true);
    addResult("🚀 Testing HashPack signing only...");

    try {
      // Create a simple test transaction
      const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString("0.0.9533134")) // Exchange contract
        .setGas(100000)
        .setFunction("name", new ContractFunctionParameters());

      addResult("📝 Transaction created, requesting HashPack signing...");
      
      const response = await hashConnectSessionManager.sendTransaction(transaction);
      addResult(`✅ HashPack signing response: ${JSON.stringify(response)}`);
      
      if (response) {
        addResult("🎉 HashPack popup should have appeared for signing!");
      }
      
    } catch (error) {
      addResult(`❌ HashPack signing error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTransactionId(null);
    setShowTransactionMonitor(false);
    setStep('idle');
  };

  const getStepIcon = () => {
    switch (step) {
      case 'preparing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'modal': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'signing': return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'preparing': return "Preparing...";
      case 'modal': return "Modal Confirmation";
      case 'signing': return "HashPack Signing";
      case 'complete': return "Complete";
      default: return "Ready";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Complete Swap Flow Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {getStepIcon()}
          <span className="font-semibold">{getStepText()}</span>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testCompleteSwapFlow}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Test Complete Flow
          </Button>

          <Button
            onClick={testHashPackSigningOnly}
            disabled={isLoading}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Test HashPack Only
          </Button>

          <Button
            onClick={clearResults}
            variant="outline"
            className="border-gray-500 text-gray-700 hover:bg-gray-50"
          >
            Clear Results
          </Button>
        </div>

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

        {/* Transaction Monitor */}
        {showTransactionMonitor && currentTransactionId && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Transaction Monitor</h4>
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

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This test simulates the complete swap flow:
            <br />• Step 1: Check HashPack connection
            <br />• Step 2: Create test quote
            <br />• Step 3: Simulate modal confirmation
            <br />• Step 4: Execute swap (should trigger HashPack popup)
            <br />• Step 5: Monitor transaction
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
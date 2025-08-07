import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, Zap, ArrowRight } from 'lucide-react';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { hederaContractService } from '@/services/hederaContractService';
import { realHashConnectService } from '@/services/realHashConnectService';

export function SimpleSwapTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentStep(0);
  };

  const runCompleteSwapTest = async () => {
    setIsTesting(true);
    setCurrentStep(0);
    setTestResults([]);
    
    addResult("🚀 Starting Complete Swap Test...");

    try {
      // Step 1: Initialize HashPack
      setCurrentStep(1);
      addResult("📱 Step 1: Initializing HashPack...");
      
      const initialized = await hashConnectSessionManager.initialize();
      if (!initialized) {
        addResult("❌ HashPack initialization failed");
        return;
      }
      addResult("✅ HashPack initialized successfully");

      // Step 2: Connect to HashPack
      setCurrentStep(2);
      addResult("🔗 Step 2: Connecting to HashPack...");
      
      const connected = await hashConnectSessionManager.connectToLocalWallet();
      if (!connected) {
        addResult("❌ HashPack connection failed");
        addResult("💡 Please ensure HashPack extension is installed and unlocked");
        return;
      }
      addResult("✅ HashPack connected successfully");

      // Step 3: Check Session Readiness
      setCurrentStep(3);
      addResult("🔍 Step 3: Checking session readiness...");
      
      const session = hashConnectSessionManager.getSession();
      addResult(`📊 Session Status: Topic=${session.topic ? '✅' : '❌'}, EncryptionKey=${session.encryptionKey ? '✅' : '❌'}`);
      
      if (!hashConnectSessionManager.isSessionReady()) {
        addResult("⚠️ Session not ready, attempting to establish full session...");
        const established = await hashConnectSessionManager.forceEstablishSession();
        if (!established) {
          addResult("❌ Could not establish full session");
          addResult("💡 Try manually connecting HashPack first");
          return;
        }
        addResult("✅ Full session established");
      } else {
        addResult("✅ Session is ready for transactions");
      }

      // Step 4: Test Simple Transaction
      setCurrentStep(4);
      addResult("📝 Step 4: Testing simple transaction...");
      
      const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
      
      const testTransaction = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString("0.0.9533134")) // Exchange contract
        .setGas(100000)
        .setFunction("name", new ContractFunctionParameters());

      addResult("📱 HashPack popup should appear now - please approve the transaction");
      
      const response = await hashConnectSessionManager.sendTransaction(testTransaction);
      addResult(`✅ Transaction sent successfully: ${JSON.stringify(response)}`);

      // Step 5: Test Real Swap Transaction
      setCurrentStep(5);
      addResult("🔄 Step 5: Testing real swap transaction...");
      
      // Create test quote
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

      addResult("📊 Creating swap transaction with test data...");
      
      const swapResult = await hederaContractService.executeSwap(
        testQuote,
        testFromToken,
        testToToken,
        "10", // 10 HBAR
        0.5 // 0.5% slippage
      );

      if (swapResult.success) {
        addResult(`🎉 Swap transaction successful! TX Hash: ${swapResult.txHash}`);
      } else {
        addResult(`❌ Swap transaction failed: ${swapResult.error}`);
      }

      addResult("✅ Complete swap test finished!");

    } catch (error) {
      addResult(`❌ Test failed with error: ${error}`);
      console.error("Swap test error:", error);
    } finally {
      setIsTesting(false);
      setCurrentStep(0);
    }
  };

  const testHashPackConnectionOnly = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    addResult("🔗 Testing HashPack Connection Only...");

    try {
      // Initialize
      const initialized = await hashConnectSessionManager.initialize();
      addResult(`Initialization: ${initialized ? '✅' : '❌'}`);

      // Connect
      const connected = await hashConnectSessionManager.connectToLocalWallet();
      addResult(`Connection: ${connected ? '✅' : '❌'}`);

      // Check session
      const session = hashConnectSessionManager.getSession();
      addResult(`Session Ready: ${hashConnectSessionManager.isSessionReady() ? '✅' : '❌'}`);
      addResult(`Topic: ${session.topic ? '✅' : '❌'}`);
      addResult(`EncryptionKey: ${session.encryptionKey ? '✅' : '❌'}`);

      // Test transaction
      if (hashConnectSessionManager.isSessionReady()) {
        addResult("📝 Testing transaction signing...");
        const { ContractExecuteTransaction, ContractId, ContractFunctionParameters } = await import("@hashgraph/sdk");
        
        const transaction = new ContractExecuteTransaction()
          .setContractId(ContractId.fromString("0.0.9533134"))
          .setGas(100000)
          .setFunction("name", new ContractFunctionParameters());

        const response = await hashConnectSessionManager.sendTransaction(transaction);
        addResult(`✅ Transaction test successful: ${JSON.stringify(response)}`);
      } else {
        addResult("❌ Cannot test transaction - session not ready");
      }

    } catch (error) {
      addResult(`❌ Connection test failed: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (currentStep > step) return "✅";
    if (currentStep === step) return "🔄";
    return "⏳";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Simple Swap Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runCompleteSwapTest}
            disabled={isTesting}
            className="bg-green-500 hover:bg-green-600"
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Complete Swap Test
          </Button>

          <Button
            onClick={testHashPackConnectionOnly}
            disabled={isTesting}
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

        {/* Progress Steps */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Test Progress</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div>{getStepStatus(1)} Initialize HashPack</div>
            <div>{getStepStatus(2)} Connect to HashPack</div>
            <div>{getStepStatus(3)} Check Session Readiness</div>
            <div>{getStepStatus(4)} Test Simple Transaction</div>
            <div>{getStepStatus(5)} Test Real Swap Transaction</div>
          </div>
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

        {/* Instructions */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This test will verify the complete swap flow from HashPack connection to transaction execution.
            <br />• Make sure HashPack extension is installed and unlocked
            <br />• The test will trigger HashPack popups for transaction approval
            <br />• Follow the progress steps to identify where issues occur
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
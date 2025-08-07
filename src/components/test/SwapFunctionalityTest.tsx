import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Zap, Wallet, Hash } from 'lucide-react';
import { hederaContractService } from '@/services/hederaContractService';
import { realHashConnectService } from '@/services/realHashConnectService';
import { hashConnectSessionManager } from '@/services/hashConnectSessionManager';
import { autoSessionRefreshService } from '@/services/autoSessionRefreshService';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

export function SwapFunctionalityTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testHashPackConnection = async () => {
    setIsLoading(true);
    addResult("🔍 Testing HashPack connection...");

    try {
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0) {
        addResult("✅ HashPack connected successfully");
        addResult(`📱 Connected account: ${sessionStatus.connectedAccounts[0]}`);
        return true;
      } else {
        addResult("❌ HashPack not connected");
        return false;
      }
    } catch (error) {
      addResult(`❌ HashPack connection error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testContractDeployment = async () => {
    setIsLoading(true);
    addResult("🔍 Testing contract deployment...");

    try {
      const isDeployed = await hederaContractService.checkContractDeployment();
      
      if (isDeployed) {
        addResult("✅ Contracts are deployed");
        const addresses = hederaContractService.getContractAddresses();
        addResult(`📋 Exchange: ${addresses.exchange}`);
        addResult(`📋 SaucerSwap: ${addresses.saucerswap}`);
        addResult(`📋 HeliSwap: ${addresses.heliswap}`);
        addResult(`📋 Pangolin: ${addresses.pangolin}`);
        return true;
      } else {
        addResult("❌ Contracts not deployed");
        return false;
      }
    } catch (error) {
      addResult(`❌ Contract deployment check error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testQuoteGeneration = async () => {
    setIsLoading(true);
    addResult("🔍 Testing quote generation...");

    try {
      const fromToken = {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.2",
        decimals: 8,
        logoUrl: ""
      };

      const toToken = {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.1234567",
        decimals: 6,
        logoUrl: ""
      };

      const quotes = await hederaContractService.getQuotes(fromToken, toToken, "1");
      
      if (quotes && quotes.length > 0) {
        addResult(`✅ Generated ${quotes.length} quotes`);
        quotes.forEach((quote, index) => {
          addResult(`📊 Quote ${index + 1}: ${quote.dex} - ${quote.outputAmount} USDC`);
        });
        return quotes[0]; // Return best quote
      } else {
        addResult("❌ No quotes generated");
        return null;
      }
    } catch (error) {
      addResult(`❌ Quote generation error: ${error}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const testSwapExecution = async (quote: any) => {
    setIsLoading(true);
    addResult("🚀 Testing swap execution...");

    try {
      const fromToken = {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.2",
        decimals: 8,
        logoUrl: ""
      };

      const toToken = {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.1234567",
        decimals: 6,
        logoUrl: ""
      };

      addResult("📝 Executing swap transaction...");
      const result = await hederaContractService.executeSwap(quote, fromToken, toToken, "0.1", 0.5);
      
      if (result.success) {
        addResult(`✅ Swap executed successfully!`);
        addResult(`🔗 Transaction ID: ${result.txHash}`);
        setCurrentTransactionId(result.txHash || null);
        setShowTransactionMonitor(true);
        return true;
      } else {
        addResult(`❌ Swap failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      addResult(`❌ Swap execution error: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    addResult("🧪 Starting full swap functionality test...");

    try {
      // Step 1: Test HashPack connection
      const isConnected = await testHashPackConnection();
      if (!isConnected) {
        addResult("❌ Test stopped: HashPack not connected");
        return;
      }

      // Step 2: Test contract deployment
      const isDeployed = await testContractDeployment();
      if (!isDeployed) {
        addResult("❌ Test stopped: Contracts not deployed");
        return;
      }

      // Step 3: Test quote generation
      const bestQuote = await testQuoteGeneration();
      if (!bestQuote) {
        addResult("❌ Test stopped: No quotes available");
        return;
      }

      // Step 4: Test swap execution
      const swapSuccess = await testSwapExecution(bestQuote);
      if (swapSuccess) {
        addResult("🎉 Full test completed successfully!");
      } else {
        addResult("❌ Test failed at swap execution");
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTransactionId(null);
    setShowTransactionMonitor(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Swap Functionality Test
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
            onClick={testHashPackConnection}
            disabled={isLoading}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Test HashPack
          </Button>

          <Button
            onClick={testContractDeployment}
            disabled={isLoading}
            variant="outline"
            className="border-purple-500 text-purple-700 hover:bg-purple-50"
          >
            <Hash className="h-4 w-4 mr-2" />
            Test Contracts
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
            This test will attempt to execute a real swap transaction. Make sure you have:
            <br />• HashPack wallet connected
            <br />• Sufficient HBAR balance for gas fees
            <br />• Smart contracts deployed on mainnet
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
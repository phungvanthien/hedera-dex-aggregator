import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wallet, Shield, Zap, RefreshCw } from 'lucide-react';
import { tokenAssociationService, TokenInfo } from '@/services/tokenAssociationService';
import { TransactionMonitor } from '@/components/transaction/TransactionMonitor';

export function TokenPreparationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [tokenStatus, setTokenStatus] = useState<{
    isAssociated: boolean;
    currentAllowance: string;
    needsApproval: boolean;
  } | null>(null);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTransactionId(null);
    setShowTransactionMonitor(false);
    setTokenStatus(null);
  };

  const testTokenAssociation = async (token: TokenInfo) => {
    setIsLoading(true);
    addResult(`🔍 Testing token association for ${token.symbol} (${token.address})`);

    try {
      // Check if already associated
      const isAssociated = await tokenAssociationService.isTokenAssociated(token.address);
      addResult(`📊 Token ${token.symbol} associated: ${isAssociated ? '✅ Yes' : '❌ No'}`);

      if (isAssociated) {
        addResult(`✅ Token ${token.symbol} is already associated with your account`);
        return;
      }

      // Associate token
      addResult(`🔄 Associating token ${token.symbol}...`);
      const result = await tokenAssociationService.associateToken(token.address);

      if (result.success) {
        addResult(`✅ Token ${token.symbol} associated successfully!`);
        addResult(`🔗 Transaction ID: ${result.transactionId}`);
        setCurrentTransactionId(result.transactionId || null);
        setShowTransactionMonitor(true);
      } else {
        addResult(`❌ Failed to associate token: ${result.error}`);
      }

    } catch (error) {
      addResult(`❌ Error during association: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTokenAllowance = async (token: TokenInfo) => {
    setIsLoading(true);
    addResult(`🔍 Testing token allowance for ${token.symbol}`);

    try {
      // Get exchange contract address
      const { getContractAddress } = await import('@/config/contracts');
      const exchangeAddress = getContractAddress("exchange");
      
      if (!exchangeAddress) {
        addResult(`❌ Exchange contract address not found`);
        return;
      }

      addResult(`📊 Exchange contract: ${exchangeAddress}`);

      // Get current allowance
      const { autoSessionRefreshService } = await import('@/services/autoSessionRefreshService');
      const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
      
      if (!sessionStatus.isConnected || sessionStatus.connectedAccounts.length === 0) {
        addResult(`❌ HashPack not connected`);
        return;
      }

      const ownerAddress = sessionStatus.connectedAccounts[0];
      const currentAllowance = await tokenAssociationService.getTokenAllowance(
        token.address,
        ownerAddress,
        exchangeAddress
      );

      addResult(`📊 Current allowance for ${token.symbol}: ${currentAllowance}`);

      // Test approval
      const testAmount = "1000000000"; // 1 token in smallest unit
      addResult(`🔄 Approving ${testAmount} ${token.symbol}...`);
      
      const result = await tokenAssociationService.approveTokenAllowance(
        token.address,
        exchangeAddress,
        testAmount
      );

      if (result.success) {
        addResult(`✅ Token ${token.symbol} approved successfully!`);
        addResult(`🔗 Transaction ID: ${result.transactionId}`);
        addResult(`📊 New allowance: ${result.allowance}`);
        setCurrentTransactionId(result.transactionId || null);
        setShowTransactionMonitor(true);
      } else {
        addResult(`❌ Failed to approve token: ${result.error}`);
      }

    } catch (error) {
      addResult(`❌ Error during allowance test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCompletePreparation = async (token: TokenInfo) => {
    setIsLoading(true);
    addResult(`🚀 Testing complete token preparation for ${token.symbol}`);

    try {
      // Get exchange contract address
      const { getContractAddress } = await import('@/config/contracts');
      const exchangeAddress = getContractAddress("exchange");
      
      if (!exchangeAddress) {
        addResult(`❌ Exchange contract address not found`);
        return;
      }

      const testAmount = "1000000000"; // 1 token in smallest unit
      
      const result = await tokenAssociationService.prepareTokenForSwap(
        token,
        exchangeAddress,
        testAmount
      );

      if (result.success) {
        addResult(`✅ Token ${token.symbol} prepared successfully!`);
        
        if (result.needsAssociation) {
          addResult(`📋 Association was needed and completed`);
          if (result.associationResult?.transactionId) {
            addResult(`🔗 Association TX: ${result.associationResult.transactionId}`);
          }
        } else {
          addResult(`📋 Token was already associated`);
        }

        if (result.needsApproval) {
          addResult(`📋 Approval was needed and completed`);
          if (result.approvalResult?.transactionId) {
            addResult(`🔗 Approval TX: ${result.approvalResult.transactionId}`);
          }
        } else {
          addResult(`📋 Token already had sufficient allowance`);
        }

        // Set transaction monitor for the last transaction
        const lastTxId = result.approvalResult?.transactionId || result.associationResult?.transactionId;
        if (lastTxId) {
          setCurrentTransactionId(lastTxId);
          setShowTransactionMonitor(true);
        }
      } else {
        addResult(`❌ Failed to prepare token: ${result.error}`);
      }

    } catch (error) {
      addResult(`❌ Error during complete preparation: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenStatus = async (token: TokenInfo) => {
    setIsLoading(true);
    addResult(`🔍 Checking status for ${token.symbol}`);

    try {
      // Check association
      const isAssociated = await tokenAssociationService.isTokenAssociated(token.address);
      addResult(`📊 ${token.symbol} associated: ${isAssociated ? '✅ Yes' : '❌ No'}`);

      // Check allowance
      const { getContractAddress } = await import('@/config/contracts');
      const exchangeAddress = getContractAddress("exchange");
      
      if (exchangeAddress) {
        const { autoSessionRefreshService } = await import('@/services/autoSessionRefreshService');
        const sessionStatus = await autoSessionRefreshService.checkAndRefreshSession();
        
        if (sessionStatus.isConnected && sessionStatus.connectedAccounts.length > 0) {
          const ownerAddress = sessionStatus.connectedAccounts[0];
          const currentAllowance = await tokenAssociationService.getTokenAllowance(
            token.address,
            ownerAddress,
            exchangeAddress
          );

          addResult(`📊 Current allowance: ${currentAllowance}`);
          
          const needsApproval = BigInt(currentAllowance) < BigInt("1000000000");
          addResult(`📊 Needs approval: ${needsApproval ? '❌ Yes' : '✅ No'}`);

          setTokenStatus({
            isAssociated,
            currentAllowance,
            needsApproval
          });
        }
      }

    } catch (error) {
      addResult(`❌ Error checking status: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const supportedTokens = tokenAssociationService.getSupportedTokens();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Token Association & Allowance Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Selection */}
        <div className="space-y-2">
          <h4 className="font-semibold">Select Token to Test:</h4>
          <div className="flex flex-wrap gap-2">
            {supportedTokens.map((token) => (
              <Button
                key={token.symbol}
                variant={selectedToken?.symbol === token.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedToken(token)}
                className="flex items-center gap-2"
              >
                {token.symbol}
                {tokenStatus && selectedToken?.symbol === token.symbol && (
                  <div className="flex gap-1">
                    {tokenStatus.isAssociated && (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    {!tokenStatus.needsApproval && (
                      <Shield className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Token Status Display */}
        {selectedToken && tokenStatus && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h5 className="font-semibold">Status for {selectedToken.symbol}:</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant={tokenStatus.isAssociated ? "default" : "destructive"}>
                {tokenStatus.isAssociated ? "Associated" : "Not Associated"}
              </Badge>
              <Badge variant={tokenStatus.needsApproval ? "destructive" : "default"}>
                {tokenStatus.needsApproval ? "Needs Approval" : "Approved"}
              </Badge>
              <Badge variant="outline">
                Allowance: {tokenStatus.currentAllowance}
              </Badge>
            </div>
          </div>
        )}

        {/* Test Controls */}
        {selectedToken && (
          <div className="space-y-2">
            <h4 className="font-semibold">Test Actions:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => checkTokenStatus(selectedToken)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>

              <Button
                onClick={() => testTokenAssociation(selectedToken)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Test Association
              </Button>

              <Button
                onClick={() => testTokenAllowance(selectedToken)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Test Allowance
              </Button>

              <Button
                onClick={() => testCompletePreparation(selectedToken)}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Complete Preparation
              </Button>
            </div>
          </div>
        )}

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
            This test helps verify token association and allowance functionality:
            <br />• <strong>Check Status:</strong> Verify if token is associated and has sufficient allowance
            <br />• <strong>Test Association:</strong> Associate token with your HashPack account
            <br />• <strong>Test Allowance:</strong> Approve token spending for exchange contract
            <br />• <strong>Complete Preparation:</strong> Do both association and approval if needed
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { hederaContractService } from '@/services/hederaContractService';
import { getContractAddress } from '@/config/contracts';

interface SwapDebugProps {
  className?: string;
}

export function SwapDebug({ className = "" }: SwapDebugProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [walletStatus, setWalletStatus] = useState<{
    connected: boolean;
    address?: string;
    network?: string;
    error?: string;
  }>({ connected: false });
  
  const [contractStatus, setContractStatus] = useState<{
    exchange: boolean;
    saucerswap: boolean;
    heliswap: boolean;
    pangolin: boolean;
    error?: string;
  }>({
    exchange: false,
    saucerswap: false,
    heliswap: false,
    pangolin: false
  });

  const [testSwapResult, setTestSwapResult] = useState<{
    success?: boolean;
    error?: string;
    txHash?: string;
  }>({});

  // Check wallet status
  const checkWalletStatus = async () => {
    setIsLoading(true);
    try {
      // Check HashPack first (Hedera native wallet)
      try {
        const { getConnectedAccountIds } = await import("@/hooks/walletConnect");
        const connectedAccountIds = getConnectedAccountIds();
        
        if (connectedAccountIds.length > 0) {
          setWalletStatus({
            connected: true,
            address: connectedAccountIds[0].toString(),
            network: "Hedera Mainnet",
          });
          return;
        }
      } catch (hashPackError) {
        console.log("HashPack not available:", hashPackError);
      }

      // Fallback to MetaMask check
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts.length > 0) {
          const network = await (window as any).ethereum.request({ 
            method: 'eth_chainId' 
          });
          
          setWalletStatus({
            connected: true,
            address: accounts[0],
            network: network,
          });
        } else {
          setWalletStatus({
            connected: false,
            error: "No accounts found"
          });
        }
      } else {
        setWalletStatus({
          connected: false,
          error: "No wallet detected (HashPack or MetaMask)"
        });
      }
    } catch (error) {
      setWalletStatus({
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check contract status
  const checkContractStatus = async () => {
    setIsLoading(true);
    try {
      const addresses = {
        exchange: getContractAddress("exchange"),
        saucerswap: getContractAddress("saucerswap"),
        heliswap: getContractAddress("heliswap"),
        pangolin: getContractAddress("pangolin"),
      };

      const deployed = await hederaContractService.checkContractDeployment();
      
      setContractStatus({
        exchange: !!addresses.exchange,
        saucerswap: !!addresses.saucerswap,
        heliswap: !!addresses.heliswap,
        pangolin: !!addresses.pangolin,
      });
    } catch (error) {
      setContractStatus({
        exchange: false,
        saucerswap: false,
        heliswap: false,
        pangolin: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test swap functionality
  const testSwap = async () => {
    setIsLoading(true);
    try {
      const mockQuote = {
        dex: "SaucerSwap",
        outputAmount: "100",
        priceImpact: "0.1",
        fee: "0.25",
        route: ["HBAR", "USDC"],
        isBest: true
      };

      const mockFromToken = {
        symbol: "HBAR",
        name: "Hedera",
        address: "0.0.3",
        decimals: 8,
        logoUrl: "",
      };

      const mockToToken = {
        symbol: "USDC",
        name: "USD Coin",
        address: "0.0.456858",
        decimals: 6,
        logoUrl: "",
      };

      const result = await hederaContractService.executeSwap(
        mockQuote,
        mockFromToken,
        mockToToken,
        "10",
        0.5
      );

      setTestSwapResult({
        success: result.success,
        error: result.error,
        txHash: result.txHash
      });
    } catch (error) {
      setTestSwapResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkWalletStatus();
    checkContractStatus();
  }, []);

  return (
    <Card className={`debug-card ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Swap Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Wallet Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Connected:</span>
              <Badge variant={walletStatus.connected ? "default" : "destructive"}>
                {walletStatus.connected ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {walletStatus.connected ? "Yes" : "No"}
              </Badge>
            </div>
            {walletStatus.address && (
              <div className="text-xs text-gray-400">
                Address: {walletStatus.address.slice(0, 10)}...{walletStatus.address.slice(-8)}
              </div>
            )}
            {walletStatus.network && (
              <div className="text-xs text-gray-400">
                Network: {walletStatus.network}
              </div>
            )}
            {walletStatus.error && (
              <div className="text-xs text-red-400">
                Error: {walletStatus.error}
              </div>
            )}
          </div>
        </div>

        {/* Contract Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Contract Status</h4>
          <div className="space-y-2">
            {Object.entries(contractStatus).map(([name, deployed]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-xs text-gray-400 capitalize">{name}:</span>
                <Badge variant={deployed ? "default" : "destructive"}>
                  {deployed ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {deployed ? "Deployed" : "Not Deployed"}
                </Badge>
              </div>
            ))}
            {contractStatus.error && (
              <div className="text-xs text-red-400">
                Error: {contractStatus.error}
              </div>
            )}
          </div>
        </div>

        {/* Test Swap */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Test Swap</h4>
          <Button
            onClick={testSwap}
            disabled={isLoading}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Test Swap Function
          </Button>
          
          {testSwapResult.success !== undefined && (
            <div className="mt-2 p-2 rounded bg-gray-800">
              <div className="text-xs">
                <div className="flex items-center">
                  <span className="text-gray-400">Success:</span>
                  <Badge variant={testSwapResult.success ? "default" : "destructive"} className="ml-2">
                    {testSwapResult.success ? "Yes" : "No"}
                  </Badge>
                </div>
                {testSwapResult.txHash && (
                  <div className="text-gray-400 mt-1">
                    TX: {testSwapResult.txHash.slice(0, 10)}...{testSwapResult.txHash.slice(-8)}
                  </div>
                )}
                {testSwapResult.error && (
                  <div className="text-red-400 mt-1">
                    Error: {testSwapResult.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={checkWalletStatus}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Refresh Wallet
          </Button>
          <Button
            onClick={checkContractStatus}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            Refresh Contracts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useState, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Settings, Wallet, TrendingUp, Zap, Loader2 } from "lucide-react";
import { TokenSelector } from "@/components/trade/token-selector";
import { RouteComparison } from "@/components/trade/route-comparison";
import { TradingChart } from "@/components/trade/trading-chart";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { WalletContext } from "@/context/WalletContext";
import { useSwap } from "@/hooks/useSwap";
import { SimpleBalanceDisplay } from "@/components/wallet/balance-display";

export default function TradePage() {
  const { accountId, balance } = useContext(WalletContext);
  const [fromToken, setFromToken] = useState("HBAR");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");


  // Check if wallet is connected
  const isWalletConnected = Boolean(accountId);

  // Swap hook with smart contract integration
  const {
    quote,
    loading,
    error,
    getQuote,
    executeSwap,
    clearError,
    clearQuote
  } = useSwap();

  // Get quote when amount changes
  useEffect(() => {
    if (isWalletConnected && fromAmount && parseFloat(fromAmount) > 0) {
      const timeoutId = setTimeout(() => {
        getQuote(fromToken, toToken, fromAmount);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [fromAmount, fromToken, toToken, isWalletConnected, getQuote]);

  // Update to amount when quote changes
  useEffect(() => {
    if (quote?.bestRoute) {
      setToAmount(quote.bestRoute.amountTo);
    }
  }, [quote]);

  // Handle swap execution
  const handleSwap = async () => {
    if (!quote?.bestRoute || !fromAmount) {
      return;
    }

    try {
      const result = await executeSwap(quote.bestRoute, fromAmount);
      
      if (result.success) {
        // Clear form after successful swap
        setFromAmount("");
        setToAmount("");
        clearQuote();
        // You could show a success toast here
        console.log("Swap successful:", result.txHash);
      } else {
        // Error is already set in the hook
        console.error("Swap failed:", result.error);
      }
    } catch (err) {
      console.error("Swap execution error:", err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trading Interface */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Swap</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <WalletSelector />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex gap-2">
                  <TokenSelector
                    value={fromToken}
                    onChange={setFromToken}
                    balance={isWalletConnected ? (balance || "0") : "0"}
                  />
                  <Input
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-right"
                    disabled={!isWalletConnected}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    <SimpleBalanceDisplay />
                  </span>
                  {isWalletConnected && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFromAmount(balance || "0")}
                    >
                      Max
                    </Button>
                  )}
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFromToken(toToken);
                    setToToken(fromToken);
                    setFromAmount(toAmount);
                    setToAmount(fromAmount);
                  }}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex gap-2">
                  <TokenSelector
                    value={toToken}
                    onChange={setToToken}
                    balance="0.00"
                  />
                  <Input
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="text-right"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Balance: {isWalletConnected ? "0.00 USDC" : "Connect Wallet"}</span>
                </div>
              </div>

              {/* Price Impact */}
              {quote?.bestRoute && (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Price Impact:</span>
                    <span className={quote.priceImpact > 2 ? "text-red-500" : "text-green-500"}>
                      {quote.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee:</span>
                    <span>{(quote.totalFee / 1000).toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Gas:</span>
                    <span>{quote.estimatedGas}</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearError}
                    className="mt-2 text-red-600 hover:text-red-700"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Swap Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={
                  !isWalletConnected ||
                  !fromAmount ||
                  !toAmount ||
                  parseFloat(fromAmount) <= 0 ||
                  loading ||
                  !quote?.bestRoute
                }
                onClick={handleSwap}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : !isWalletConnected ? (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                ) : !fromAmount || !toAmount ? (
                  "Enter Amount"
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Swap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Routes */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {fromToken}/{toToken} Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TradingChart />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="routes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteComparison quote={quote} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  {isWalletConnected ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Account:</span>
                        <Badge variant="outline">{accountId}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <span className="font-medium">{balance || "0"} HBAR</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Network:</span>
                        <Badge variant="secondary">Hedera Mainnet</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Connect your wallet to view portfolio</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

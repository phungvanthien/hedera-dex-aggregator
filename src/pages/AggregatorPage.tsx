"use client";

import { useState, useEffect, useContext } from "react";
import { WalletContext } from "@/context/WalletContext";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { TokenSelectorAggregator } from "@/components/trade/token-selector-aggregator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowDownUp, ArrowRight, Zap, TrendingUp, Shield, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

// Mock data for demonstration
const SUPPORTED_TOKENS = [
  { symbol: "HBAR", name: "Hedera", address: "0x0000000000000000000000000000000000000000", decimals: 8, icon: "🟢", price: 0.0523, change24h: 2.45 },
  { symbol: "USDC", name: "USD Coin", address: "0x0000000000000000000000000000000000000001", decimals: 6, icon: "🔵", price: 1.0000, change24h: 0.01 },
  { symbol: "USDT", name: "Tether USD", address: "0x0000000000000000000000000000000000000002", decimals: 6, icon: "🟡", price: 1.0001, change24h: -0.02 },
  { symbol: "SAUCE", name: "SaucerSwap", address: "0x0000000000000000000000000000000000000003", decimals: 18, icon: "🍝", price: 0.1234, change24h: 5.67 },
  { symbol: "HELI", name: "HeliSwap", address: "0x0000000000000000000000000000000000000004", decimals: 18, icon: "🚁", price: 0.0456, change24h: -1.23 },
  { symbol: "PNG", name: "Pangolin", address: "0x0000000000000000000000000000000000000005", decimals: 18, icon: "🐧", price: 0.0789, change24h: 3.21 },
];

const SUPPORTED_DEXES = [
  { id: "saucerswap", name: "SaucerSwap", icon: "🍝", fee: "0.3%", liquidity: "High" },
  { id: "saucerswapv2", name: "SaucerSwap V2", icon: "🍝", fee: "0.3%", liquidity: "High" },
  { id: "heliswap", name: "HeliSwap", icon: "🚁", fee: "0.3%", liquidity: "Medium" },
  { id: "pangolin", name: "Pangolin", icon: "🐧", fee: "0.3%", liquidity: "Medium" },
];

interface SwapRoute {
  dexId: string;
  dexName: string;
  amountOut: string;
  fee: string;
  priceImpact: number;
  gasEstimate: string;
  isBest: boolean;
}

export default function AggregatorPage() {
  const { accountId, balance, walletType } = useContext(WalletContext);
  const [fromToken, setFromToken] = useState(SUPPORTED_TOKENS[0]);
  const [toToken, setToToken] = useState(SUPPORTED_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [routes, setRoutes] = useState<SwapRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const isWalletConnected = !!accountId;

  // Mock function to get swap routes
  const getSwapRoutes = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setRoutes([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockRoutes: SwapRoute[] = SUPPORTED_DEXES.map((dex, index) => ({
      dexId: dex.id,
      dexName: dex.name,
      amountOut: (parseFloat(fromAmount) * (0.95 + Math.random() * 0.1)).toFixed(6),
      fee: (parseFloat(fromAmount) * 0.003).toFixed(6),
      priceImpact: Math.random() * 2,
      gasEstimate: (150000 + Math.random() * 50000).toFixed(0),
      isBest: index === 0, // First route is best
    }));

    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
    setIsLoading(false);
  };

  // Debounced effect to get routes when amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSwapRoutes();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!selectedRoute || !isWalletConnected) return;

    setIsSwapping(true);
    
    // Simulate swap transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSwapping(false);
    // Reset amounts after successful swap
    setFromAmount("");
    setToAmount("");
    setRoutes([]);
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hedera DEX Aggregator
            </h1>
            <p className="text-lg text-muted-foreground">
              Get the best swap rates across all Hedera DEXs
            </p>
          </div>

          {/* Main Swap Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Swap Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">From</Label>
                <div className="flex gap-3">
                  <TokenSelectorAggregator
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                    tokens={SUPPORTED_TOKENS}
                    disabled={!isWalletConnected}
                  />
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    disabled={!isWalletConnected}
                    className="flex-1"
                  />
                </div>
                {isWalletConnected && (
                  <div className="text-sm text-muted-foreground">
                    Balance: {formatBalance(balance || "0")} {fromToken.symbol}
                  </div>
                )}
              </div>

              {/* Switch Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchTokens}
                  className="rounded-full p-2"
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">To</Label>
                <div className="flex gap-3">
                  <TokenSelectorAggregator
                    selectedToken={toToken}
                    onTokenSelect={setToToken}
                    tokens={SUPPORTED_TOKENS}
                  />
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={selectedRoute?.amountOut || ""}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                </div>
              </div>

              {/* Wallet Connection */}
              {!isWalletConnected ? (
                <div className="text-center py-4">
                  <WalletSelector />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Slippage Settings */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Slippage Tolerance</Label>
                    <Select value={slippage.toString()} onValueChange={(value) => setSlippage(parseFloat(value))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">0.1%</SelectItem>
                        <SelectItem value="0.5">0.5%</SelectItem>
                        <SelectItem value="1.0">1.0%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Swap Button */}
                  <Button
                    onClick={handleSwap}
                    disabled={!selectedRoute || !fromAmount || isSwapping}
                    className="w-full h-12 text-lg"
                  >
                    {isSwapping ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Swapping...
                      </div>
                    ) : (
                      "Swap"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Routes Comparison */}
          {routes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Available Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routes.map((route, index) => (
                      <div
                        key={route.dexId}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRoute?.dexId === route.dexId
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedRoute(route)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {SUPPORTED_DEXES.find(d => d.id === route.dexId)?.icon}
                              </span>
                              <span className="font-medium">{route.dexName}</span>
                              {route.isBest && (
                                <Badge variant="secondary" className="text-xs">
                                  Best
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {route.amountOut} {toToken.symbol}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Fee: {route.fee} | Impact: {route.priceImpact.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="text-center p-6 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Zap className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Best Rates</h3>
              <p className="text-sm text-muted-foreground">
                Automatically find the best swap rates across all DEXs
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">
                Built on Hedera's secure and fast blockchain
              </p>
            </Card>
            <Card className="text-center p-6 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fast</h3>
              <p className="text-sm text-muted-foreground">
                Sub-second finality with Hedera's consensus
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 
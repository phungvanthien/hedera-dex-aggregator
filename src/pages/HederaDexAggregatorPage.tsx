"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUpDown,
  TrendingUp,
  Zap,
  RefreshCw,
  ChevronDown,
  ArrowLeft,
  LogOut,
  User,
  Users,
  ChevronUp,
  Settings,
  Wallet,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { WalletContext } from "@/context/WalletContext";
import { useContext } from "react";
import { SimpleBalanceDisplay } from "@/components/wallet/balance-display";
import { useSwap } from "@/hooks/useSwap";

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  price?: number;
}

interface Quote {
  dex: string;
  outputAmount: string;
  priceImpact: string;
  fee: string;
  route: string[];
  isBest?: boolean;
  pool_address?: string;
}

const tokens: Token[] = [
  {
    symbol: "HBAR",
    name: "Hedera",
    address: "0.0.3",
    decimals: 8,
    logoUrl: "/hedera-logo.svg",
    price: 0.05,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0.0.123456",
    decimals: 6,
    logoUrl: "/usdc-logo.svg",
    price: 1.0,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0.0.123457",
    decimals: 6,
    logoUrl: "/usdt-logo.svg",
    price: 1.0,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0.0.123458",
    decimals: 18,
    logoUrl: "/eth-logo.svg",
    price: 2000,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0.0.123459",
    decimals: 8,
    logoUrl: "/wbtc-logo.svg",
    price: 40000,
  },
  {
    symbol: "SAUCE",
    name: "SaucerSwap",
    address: "0.0.123460",
    decimals: 18,
    logoUrl: "/sauce-logo.svg",
    price: 0.1,
  },
  {
    symbol: "HELI",
    name: "HeliSwap",
    address: "0.0.123461",
    decimals: 18,
    logoUrl: "/heli-logo.svg",
    price: 0.02,
  },
  {
    symbol: "PNG",
    name: "Pangolin",
    address: "0.0.123462",
    decimals: 18,
    logoUrl: "/png-logo.svg",
    price: 0.5,
  },
];

const marketData = [
  { pair: "HBAR/USDC", price: "$0.05", change: "+2.5%", positive: true },
  { pair: "HBAR/USDT", price: "$0.05", change: "+1.8%", positive: true },
  { pair: "ETH/HBAR", price: "40,000", change: "-0.5%", positive: false },
  { pair: "WBTC/HBAR", price: "800,000", change: "+3.2%", positive: true },
  { pair: "SAUCE/HBAR", price: "2.0", change: "+5.1%", positive: true },
];

export default function HederaDexAggregatorPage() {
  const { accountId, balance } = useContext(WalletContext);
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapMode, setSwapMode] = useState<"same-address" | "cross-address">("same-address");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [realPrice, setRealPrice] = useState("-");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Swap hook integration
  const {
    quote: swapQuote,
    loading: swapLoading,
    error: swapError,
    getQuote,
    executeSwap,
    clearError,
    clearQuote
  } = useSwap();

  // Check if wallet is connected
  const isWalletConnected = Boolean(accountId);

  // Mock quotes for demonstration
  const mockQuotes: Quote[] = [
    {
      dex: "SaucerSwap",
      outputAmount: "0",
      priceImpact: "0.5",
      fee: "0.25",
      route: ["SaucerSwap"],
      isBest: true,
    },
    {
      dex: "HeliSwap",
      outputAmount: "0",
      priceImpact: "0.8",
      fee: "0.30",
      route: ["HeliSwap"],
    },
    {
      dex: "Pangolin",
      outputAmount: "0",
      priceImpact: "0.3",
      fee: "0.20",
      route: ["Pangolin"],
    },
  ];

  // Calculate output amount based on input
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0 && fromToken && toToken) {
      const inputAmount = parseFloat(fromAmount);
      const fromPrice = fromToken.price || 0;
      const toPrice = toToken.price || 0;
      
      if (fromPrice > 0 && toPrice > 0) {
        const outputAmount = (inputAmount * fromPrice) / toPrice;
        setToAmount(outputAmount.toFixed(6));
        
        // Update mock quotes with calculated amounts
        const updatedQuotes = mockQuotes.map((quote, index) => ({
          ...quote,
          outputAmount: (outputAmount * (1 - index * 0.01)).toFixed(6), // Simulate different DEX rates
        }));
        setQuotes(updatedQuotes);
      }
    } else {
      setToAmount("");
      setQuotes([]);
    }
  }, [fromAmount, fromToken, toToken]);

  // Get best quote
  const bestQuote = quotes.length > 0 ? quotes[0] : null;

  // Swap tokens function
  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Execute swap function
  const executeSwapOnDex = async (quote: Quote) => {
    if (!isWalletConnected || !fromAmount || parseFloat(fromAmount) <= 0) {
      return;
    }

    setIsSwapping(true);
    
    try {
      // Simulate swap execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful swap
      console.log(`Swap executed on ${quote.dex}:`, {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount,
        toAmount: quote.outputAmount,
        dex: quote.dex,
      });
      
      // Clear form after successful swap
      setFromAmount("");
      setToAmount("");
      setQuotes([]);
      
    } catch (error) {
      console.error("Swap failed:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      // Trigger quote recalculation
      const inputAmount = parseFloat(fromAmount);
      const fromPrice = fromToken.price || 0;
      const toPrice = toToken.price || 0;
      
      if (fromPrice > 0 && toPrice > 0) {
        const outputAmount = (inputAmount * fromPrice) / toPrice;
        setToAmount(outputAmount.toFixed(6));
        
        const updatedQuotes = mockQuotes.map((quote, index) => ({
          ...quote,
          outputAmount: (outputAmount * (1 - index * 0.01)).toFixed(6),
        }));
        setQuotes(updatedQuotes);
      }
    }
  };

  // Get DEX display name
  const getDexName = (quote: Quote) => {
    return quote.dex;
  };

  // Format USD value
  const formatUSD = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background image */}
      <div
        style={{
          backgroundImage: "url('/hedera-bg.png')",
          backgroundSize: "70% auto",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      
      {/* Navigation Bar */}
      <nav className="relative z-50 bg-black/80 backdrop-blur-md border-b border-green-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/hedera_dex.png"
                alt="Hedera DEX Logo"
                className="h-10 w-10 mr-3 inline-block align-middle"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Hedera DEX Aggregator
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                Home
              </a>
              <a
                href="/hedera-dex-aggregator"
                className="text-green-400 border-b-2 border-green-400 font-semibold transition-colors"
              >
                Aggregator
              </a>
              <a
                href="/trade"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                Trade
              </a>
              
              {/* Wallet Selector */}
              <WalletSelector />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-green-400"
            >
              {isMenuOpen ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a
                href="/"
                className="block text-gray-300 hover:text-green-400 transition-colors"
              >
                Home
              </a>
              <a
                href="/hedera-dex-aggregator"
                className="block text-green-400 border-b-2 border-green-400 font-semibold transition-colors"
              >
                Aggregator
              </a>
              <a
                href="/trade"
                className="block text-gray-300 hover:text-green-400 transition-colors"
              >
                Trade
              </a>
              
              {/* Wallet Selector */}
              <WalletSelector />
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="swap-main-container flex justify-center items-start gap-8 max-w-[1280px] mx-auto px-4 py-8">
        {/* Left Sidebar - Swap Settings */}
        <div className="hidden xl:block w-80">
          <Card className="settings-panel mb-4 bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Swap Settings
              </h3>
              
              {/* Wallet Status */}
              {isWalletConnected && accountId && (
                <div className="wallet-status mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-white">
                      Hedera Wallet Connected
                    </span>
                  </div>
                  <div className="w-full flex justify-center">
                    <code className="text-xs text-gray-400 font-mono text-center">
                      {accountId}
                    </code>
                  </div>
                  <div className="text-center mt-2">
                    <SimpleBalanceDisplay className="text-sm text-green-400" />
                  </div>
                </div>
              )}
              
              {/* Slippage Tolerance */}
              <div className="mb-4">
                <label className="text-sm text-gray-300 mb-2 block">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`px-3 py-1 text-xs rounded font-bold transition-colors duration-150 ${
                        slippage === option
                          ? "bg-green-500 text-black"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => setSlippage(option)}
                    >
                      {option}%
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Transaction Deadline */}
              <div className="mb-4">
                <label className="text-sm text-gray-300 mb-2 block">
                  Transaction Deadline
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    defaultValue="20"
                    className="bg-gray-800 border border-gray-600 text-white px-3 py-2 w-20 rounded"
                  />
                  <span className="text-gray-400 text-sm">minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Transactions */}
          <Card className="swap-card bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">
                Recent Transactions
              </h3>
              <div className="space-y-2">
                <div className="transaction-item flex items-center justify-between p-2 rounded bg-gray-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">HBAR → USDC</span>
                  </div>
                  <span className="text-xs text-gray-400">3m ago</span>
                </div>
                <div className="transaction-item flex items-center justify-between p-2 rounded bg-gray-800/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">ETH → HBAR</span>
                  </div>
                  <span className="text-xs text-gray-400">36m ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Swap Card */}
        <div className="flex-1 min-w-[350px] max-w-[540px] mx-auto">
          <Card className="swap-card p-6 bg-gray-900/50 border-green-500/20">
            <CardContent className="p-6">
              {/* Swap Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Hedera DEX Aggregator</h2>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    onClick={swapTokens}
                    title="Swap tokens"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    onClick={handleManualRefresh}
                    title="Refresh quotes"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Price Display */}
              {fromToken.symbol === "HBAR" && toToken.symbol === "USDC" && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">
                        Real-time HBAR/USDC Price:
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-400">
                      $0.05
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    From Hedera Network • Updates every 30s
                  </div>
                </div>
              )}

              {/* Swap Mode Selector */}
              <div className="flex flex-col w-full max-w-md mb-4">
                <span className="text-sm text-gray-300 mb-2 text-left">
                  Swap Mode:
                </span>
                <div className="flex justify-center items-center gap-0 bg-gray-800 rounded-xl p-1 w-full">
                  <button
                    onClick={() => setSwapMode("same-address")}
                    className={`w-1/2 flex-1 py-3 rounded-xl text-base font-semibold flex items-center justify-center transition-colors duration-150 ${
                      swapMode === "same-address"
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Same Address
                  </button>
                  <button
                    onClick={() => setSwapMode("cross-address")}
                    className={`w-1/2 flex-1 py-3 rounded-xl text-base font-semibold flex items-center justify-center transition-colors duration-150 ${
                      swapMode === "cross-address"
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-black shadow-lg"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Cross Address
                  </button>
                </div>
              </div>

              {/* Receiver Address Input (for cross-address mode) */}
              {swapMode === "cross-address" && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Receiver Address
                  </label>
                  <Input
                    type="text"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder={!isWalletConnected ? "Connect wallet first" : "Enter receiver address"}
                    className="bg-gray-800 border-gray-600 text-white"
                    disabled={!isWalletConnected}
                  />
                </div>
              )}

              {/* Wallet Connection Status */}
              {!isWalletConnected && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-center">
                    <p className="text-sm text-red-400 mb-2">
                      Wallet not connected
                    </p>
                    <p className="text-xs text-gray-400 mb-3">
                      Connect your Hedera wallet to start trading
                    </p>
                    <WalletSelector />
                  </div>
                </div>
              )}

              {/* From Token */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      You pay
                    </label>
                    <div className="flex items-center gap-2">
                      {isWalletConnected && Number(balance) > 0 && (
                        <button
                          type="button"
                          className="px-2 py-0.5 rounded bg-green-500 text-black text-xs font-semibold mr-2 hover:bg-green-400 transition-colors"
                          onClick={() => setFromAmount(balance || "0")}
                        >
                          Max
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        Balance: {isWalletConnected ? (balance || "0.00") : "0.00"}
                      </span>
                    </div>
                  </div>
                  <div className="token-selector rounded-xl p-4 bg-gray-800 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          className="bg-transparent border-none text-2xl font-bold text-white placeholder-gray-400 p-0 h-auto focus:ring-0"
                          disabled={!isWalletConnected}
                        />
                        <div className="text-sm text-gray-400 mt-1">
                          ≈ ${fromToken.price ? (parseFloat(fromAmount || "0") * fromToken.price).toFixed(2) : "0.00"}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center space-x-2 rounded-lg px-3 py-2 ml-4 bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-800">
                            {fromToken.symbol.charAt(0)}
                          </span>
                        </div>
                        <span className="ml-2 font-semibold text-white">
                          {fromToken.symbol}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-1 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Token Dropdown */}
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl z-50 max-h-48 overflow-y-auto bg-gray-800 border border-gray-600">
                      {tokens
                        .filter((token) => token.symbol !== toToken.symbol)
                        .map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setFromToken(token);
                              setShowFromDropdown(false);
                            }}
                            className="w-full flex items-center justify-between p-3 first:rounded-t-xl last:rounded-b-xl hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-800">
                                  {token.symbol.charAt(0)}
                                </span>
                              </div>
                              <div className="text-left">
                                <div className="text-white font-semibold">
                                  {token.symbol}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-sm font-medium">
                                {token.price ? `$${token.price}` : "N/A"}
                              </div>
                              <div className="text-xs text-gray-400">
                                Price
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* To Token */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">
                      You receive
                    </label>
                    <span className="text-xs text-gray-400">
                      Balance: 0.00
                    </span>
                  </div>
                  <div className="token-selector rounded-xl p-4 bg-gray-800 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="0"
                          value={toAmount}
                          readOnly
                          className="bg-transparent border-none text-2xl font-bold text-white placeholder-gray-400 p-0 h-auto focus:ring-0"
                        />
                        <div className="text-sm text-gray-400 mt-1">
                          ≈ ${toToken.price ? (parseFloat(toAmount || "0") * toToken.price).toFixed(2) : "0.00"}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="flex items-center space-x-2 rounded-lg px-3 py-2 ml-4 bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-800">
                            {toToken.symbol.charAt(0)}
                          </span>
                        </div>
                        <span className="ml-2 font-semibold text-white">
                          {toToken.symbol}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-1 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Token Dropdown */}
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl z-50 max-h-48 overflow-y-auto bg-gray-800 border border-gray-600">
                      {tokens
                        .filter((token) => token.symbol !== fromToken.symbol)
                        .map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setToToken(token);
                              setShowToDropdown(false);
                            }}
                            className="w-full flex items-center justify-between p-3 first:rounded-t-xl last:rounded-b-xl hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-800">
                                  {token.symbol.charAt(0)}
                                </span>
                              </div>
                              <div className="text-left">
                                <div className="text-white font-semibold">
                                  {token.symbol}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-sm font-medium">
                                {token.price ? `$${token.price}` : "N/A"}
                              </div>
                              <div className="text-xs text-gray-400">
                                Price
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Route Information */}
              {quotes.length > 0 && (
                <div className="route-info rounded-lg p-3 bg-gray-800/50 border border-gray-600 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Compare DEX Quotes
                    </span>
                    {bestQuote && (
                      <Badge className="bg-green-500 text-black text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Best: {getDexName(bestQuote)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                          <th className="py-1 pr-4 text-left w-32">DEX</th>
                          <th className="py-1 pr-4 text-right">Output</th>
                          <th className="py-1 pr-4 text-right">Fee (%)</th>
                          <th className="py-1 pr-4 text-right">Price Impact</th>
                          <th className="py-1 pr-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((q, idx) => {
                          const isBest = idx === 0;
                          return (
                            <tr
                              key={q.dex + q.outputAmount}
                              className={idx === 0 ? "bg-green-900/20" : ""}
                            >
                              <td className="py-1 pr-4 font-semibold text-white text-left">
                                <span>{getDexName(q)}</span>
                                {isBest && (
                                  <span className="ml-2 text-green-400 font-bold">
                                    Best
                                  </span>
                                )}
                              </td>
                              <td className="py-1 pr-4 text-white text-right">
                                {q.outputAmount}
                              </td>
                              <td className="py-1 pr-4 text-white text-right">
                                {q.fee}
                              </td>
                              <td className="py-1 pr-4 text-white text-right">
                                {q.priceImpact}%
                              </td>
                              <td className="py-1 pr-4 text-center">
                                <button
                                  onClick={() => executeSwapOnDex(q)}
                                  disabled={
                                    !isWalletConnected ||
                                    !fromAmount ||
                                    Number.parseFloat(fromAmount) <= 0 ||
                                    isSwapping
                                  }
                                  className="px-2 py-1 text-xs rounded font-semibold bg-green-500 text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isSwapping ? "Swapping..." : "Swap"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={() => {
                  if (bestQuote) {
                    executeSwapOnDex(bestQuote);
                  }
                }}
                disabled={
                  !isWalletConnected ||
                  !fromAmount ||
                  Number.parseFloat(fromAmount) <= 0 ||
                  isSwapping ||
                  (swapMode === "cross-address" && !receiverAddress) ||
                  !bestQuote ||
                  Number.parseFloat(bestQuote.outputAmount) <= 0
                }
                className="w-full font-bold py-4 rounded-xl text-lg mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {swapMode === "cross-address"
                      ? "Cross-Address Swapping..."
                      : "Swapping..."}
                  </div>
                ) : !isWalletConnected ? (
                  "Connect Hedera Wallet"
                ) : !fromAmount || Number.parseFloat(fromAmount) <= 0 ? (
                  "Enter Amount"
                ) : swapMode === "cross-address" && !receiverAddress ? (
                  "Add Receiver Address"
                ) : swapMode === "cross-address" ? (
                  `Swap ${fromToken.symbol} → ${toToken.symbol} (Cross-Address)`
                ) : (
                  `Swap ${fromToken.symbol} for ${toToken.symbol}`
                )}
              </Button>

              {/* Cross-Address Info */}
              {swapMode === "cross-address" && isWalletConnected && fromAmount && (
                <div className="cross-address-info mt-3 p-3 rounded-lg bg-gray-800/50 border border-gray-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      Cross-Address Swap
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>
                      From: {accountId ? `${accountId.slice(0, 10)}...${accountId.slice(-6)}` : "Connect wallet first"}
                    </div>
                    <div>
                      To: {receiverAddress ? `${receiverAddress.slice(0, 10)}...${receiverAddress.slice(-6)}` : "Add receiver address"}
                    </div>
                    <div>Using: Hedera DEX Aggregator</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Market Info */}
        <div className="hidden xl:block w-80">
          {/* Market Overview */}
          <Card className="swap-card bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">Market Overview</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-gray-400 font-normal">Pair</th>
                    <th className="text-right text-gray-400 font-normal">Price</th>
                    <th className="text-right text-gray-400 font-normal">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((row) => (
                    <tr
                      key={row.pair}
                      className="border-b border-gray-800 last:border-0"
                    >
                      <td className="py-2 text-white">{row.pair}</td>
                      <td className="py-2 text-right text-white">{row.price}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          row.positive ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <Card className="swap-card mt-6 bg-gray-900/50 border-green-500/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">Platform Stats</h3>
              <div className="space-y-3">
                <div className="platform-stat flex justify-between">
                  <span className="text-gray-400 text-sm">24h Volume</span>
                  <span className="text-white font-medium">$1,234</span>
                </div>
                <div className="platform-stat flex justify-between">
                  <span className="text-gray-400 text-sm">Total Liquidity</span>
                  <span className="text-white font-medium">$15,678</span>
                </div>
                <div className="platform-stat flex justify-between">
                  <span className="text-gray-400 text-sm">Active Pairs</span>
                  <span className="text-white font-medium">24</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
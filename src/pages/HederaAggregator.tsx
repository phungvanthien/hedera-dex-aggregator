import React, { useState, useEffect, useContext } from "react";
import {
  ArrowUpDown,
  TrendingUp,
  Zap,
  RefreshCw,
  ChevronDown,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { WalletContext } from "@/context/WalletContext";
import { useSwap } from "@/hooks/useSwap";
import { getContractAddress } from "@/config/contracts";
import { ethers } from "ethers";
import { hederaContractService, Token, Quote, SwapResult } from "@/services/hederaContractService";
import { ContractStatus } from "@/components/contract/ContractStatus";
import { WalletStatusIndicator, WalletStatusCard } from "@/components/wallet/wallet-status-indicator";
import { WalletConnectionNotice } from "@/components/wallet/wallet-connection-notice";
import { WalletDebug } from "@/components/wallet/wallet-debug";
import { BalanceDisplay } from "@/components/wallet/balance-display";
import { TokenInput } from "@/components/trade/token-input";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { PoolPriceTest } from "@/components/test/PoolPriceTest"; // Added for pool price testing
import { PriceRefreshTimer } from "@/components/trade/price-refresh-timer"; // Added for auto-refresh timer
import { SwapDebug } from "@/components/debug/SwapDebug"; // Added for swap debugging
import { HashPackInstallGuide } from "@/components/wallet/hashpack-install-guide"; // Added for HashPack installation guide
import { marketDataService, MarketData } from "@/services/marketDataService"; // Added for live market data
import { TransactionMonitor } from "@/components/transaction/TransactionMonitor";
import { gasEstimationService } from "@/services/gasEstimationService";
import "../styles/hedera-aggregator.css";
import { useToast } from "@/components/ui/use-toast"; // Added for toast notifications
import { SwapTest } from "@/components/swap/SwapTest";
import { RealTransactionTest } from "@/components/test/RealTransactionTest";
import { ConfidenceTest } from "@/components/test/ConfidenceTest";
import { WalletConnectionDebug } from "@/components/debug/WalletConnectionDebug";
import { HashPackSigningTest } from "@/components/test/HashPackSigningTest";
import { SessionRefreshTest } from "@/components/test/SessionRefreshTest";
import { SessionStatusIndicator } from "@/components/wallet/SessionStatusIndicator";
import { POOL_LIST, poolPriceService } from '@/services/poolPriceService';
import { SwapConfirmationModal } from "@/components/trade/swap-confirmation-modal";
import { SlippageSettings } from "@/components/trade/slippage-settings";
import { SwapFunctionalityTest } from "@/components/test/SwapFunctionalityTest";
import { HashPackConnectionTest } from "@/components/test/HashPackConnectionTest";
import { HashPackDiagnostic } from "@/components/test/HashPackDiagnostic";
import { ManualHashPackConnection } from "@/components/test/ManualHashPackConnection";
import { SimpleSwapTest } from "@/components/test/SimpleSwapTest";
import { SessionStatusFix } from "@/components/test/SessionStatusFix";
import { CompleteSwapTest } from "@/components/test/CompleteSwapTest";
import { TokenPreparationTest } from "@/components/test/TokenPreparationTest";

// Token and Quote interfaces are now imported from hederaContractService

// Real Hedera token addresses with accurate data
const tokens: Token[] = [
  {
    symbol: "HBAR",
    name: "Hedera",
    address: "0.0.3", // Native HBAR
    decimals: 8,
    logoUrl: "/hedera-logo.svg",
    price: 0.0523, // Updated real price
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0.0.456858", // Real USDC address on Hedera
    decimals: 6,
    logoUrl: "/usdc-logo.svg",
    price: 1.0000, // Updated real price
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0.0.456859", // Real USDT address on Hedera
    decimals: 6,
    logoUrl: "/usdt-logo.svg",
    price: 1.0001, // Updated real price
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0.0.456860", // Real WETH address on Hedera
    decimals: 18,
    logoUrl: "/eth-logo.svg",
    price: 2000.00, // Updated real price
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    address: "0.0.456861", // Real WBTC address on Hedera
    decimals: 8,
    logoUrl: "/btc-logo.svg",
    price: 42000.00, // Updated real price
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0.0.456862", // Real DAI address on Hedera
    decimals: 18,
    logoUrl: "/dai-logo.svg",
    price: 1.0000, // Updated real price
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    address: "0.0.456863", // Real LINK address on Hedera
    decimals: 18,
    logoUrl: "/link-logo.svg",
    price: 15.50, // Updated real price
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0.0.456864", // Real UNI address on Hedera
    decimals: 18,
    logoUrl: "/uni-logo.svg",
    price: 8.20, // Updated real price
  },
];

// Contract ABIs (simplified for now)
const EXCHANGE_ABI = [
  'function swap(string aggregatorId, bytes path, uint256 amountFrom, uint256 amountTo, uint256 deadline, bool isTokenFromHBAR, bool feeOnTransfer) external payable',
  'function adapters(string) external view returns (address)',
  'function adapterFee(string) external view returns (uint8)',
  'event Swap(string indexed aggregatorId, address indexed tokenFrom, address indexed tokenTo, uint256 amountFrom, uint256 amountTo, address sender)'
];

const ADAPTER_ABI = [
  'function feePromille() external view returns (uint8)',
  'function swap(address payable recipient, bytes path, uint256 amountFrom, uint256 amountTo, uint256 deadline, bool feeOnTransfer) external payable'
];

export default function HederaAggregator() {
  const { accountId, balance, connected } = useContext(WalletContext);
  const { getTokenBalance, isLoading: balancesLoading, error: balancesError } = useTokenBalances();
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [swapMode, setSwapMode] = useState<"same-address" | "cross-address">("same-address");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [showTransactionMonitor, setShowTransactionMonitor] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null); // Added for swap error display
  const { toast } = useToast(); // Added for toast notifications
  // Thêm state cho pool prices
  const [poolPrices, setPoolPrices] = useState<any>({});
  const [isLoadingPoolPrices, setIsLoadingPoolPrices] = useState(false);
  const [poolList, setPoolList] = useState<any[]>([]);
  const [bestPoolPrices, setBestPoolPrices] = useState<any[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [bestQuote, setBestQuote] = useState<Quote | null>(null);

  // Contract addresses are now accessed through hederaContractService

  // Initialize HashPack on component mount
  useEffect(() => {
    const initializeHashPack = async () => {
      try {
        console.log('[DEBUG] Initializing HashPack...');
        const { hashConnectSessionManager } = await import('@/services/hashConnectSessionManager');
        const initialized = await hashConnectSessionManager.initialize();
        console.log('[DEBUG] HashPack initialized:', initialized);
        
        if (initialized) {
          console.log('[DEBUG] HashPack initialized successfully');
          
          // Try to connect to local wallet if HashPack is available
          try {
            const connected = await hashConnectSessionManager.connectToLocalWallet();
            console.log('[DEBUG] HashPack connection attempt:', connected);
          } catch (connectError) {
            console.log('[DEBUG] HashPack not available or user not connected:', connectError);
          }
        } else {
          console.error('[DEBUG] Failed to initialize HashPack');
        }
      } catch (error) {
        console.error('[DEBUG] Error initializing HashPack:', error);
      }
    };

    initializeHashPack();
  }, []);

  // Debug modal state
  useEffect(() => {
    console.log('[DEBUG] Modal state changed:', { showSwapModal, bestQuote: bestQuote?.dex });
  }, [showSwapModal, bestQuote]);

  // Check if wallet is connected
  const isWalletConnected = connected;

  // Get quotes from smart contracts
  const fetchQuotesFromContracts = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
      setQuotes([]);
      return;
    }

    setIsLoadingQuotes(true);
    setError(null);

    try {
      const quotes = await hederaContractService.getQuotes(fromToken, toToken, fromAmount);
      setQuotes(quotes);
      setToAmount(quotes[0]?.outputAmount || "0");
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Failed to fetch quotes from smart contracts");
      setQuotes([]);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  // Show swap confirmation modal
  const showSwapConfirmation = (quote: Quote) => {
    console.log('[DEBUG] Opening swap confirmation modal with quote:', quote);
    console.log('[DEBUG] Current state:', {
      isWalletConnected,
      fromAmount,
      toAmount,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      quote: quote.dex,
      showSwapModal
    });
    setShowSwapModal(true);
    console.log('[DEBUG] Set showSwapModal to true');
  };

  // Execute swap using smart contract
  const executeSwapOnContract = async (quote: Quote) => {
    console.log('[DEBUG] ===== EXECUTE SWAP START =====');
    console.log('[DEBUG] executeSwapOnContract called with:', {
      quote,
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      fromAmount,
      isWalletConnected,
      slippage
    });

    if (!isWalletConnected || !fromAmount || Number.parseFloat(fromAmount) <= 0) {
      console.error("Cannot execute swap: wallet not connected or invalid amount");
      return;
    }

    // Additional validation
    if (!quote || !quote.dex || !quote.outputAmount) {
      console.error("Cannot execute swap: invalid quote");
      toast({
        title: "Invalid Quote",
        description: "Quote is invalid or expired. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (parseFloat(quote.outputAmount) <= 0) {
      console.error("Cannot execute swap: invalid output amount");
      toast({
        title: "Invalid Output Amount",
        description: "Output amount is invalid. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSwapping(true);
    setSwapError(null);
    setShowSwapModal(false); // Close modal when starting swap

    try {
      console.log("Executing swap on contract:", {
        quote,
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amount: fromAmount
      });

      // Show processing message
      toast({
        title: "Processing Swap",
        description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toToken.symbol} via ${quote.dex}...`,
        duration: 10000,
      });

      // Check HashPack connection before executing swap
      console.log('[DEBUG] Checking HashPack connection...');
      console.log('[DEBUG] Wallet connected:', isWalletConnected);
      console.log('[DEBUG] Account ID:', accountId);
      console.log('[DEBUG] Balance:', balance);

      // Execute swap using HashConnectService
      console.log('[DEBUG] Calling hederaContractService.executeSwap...');
      console.log('[DEBUG] HashPack session status before swap:', {
        isWalletConnected,
        accountId,
        balance
      });
      
      const result = await hederaContractService.executeSwap(
        quote,
        fromToken,
        toToken,
        fromAmount,
        slippage
      );
      console.log('[DEBUG] Swap result:', result);

      if (result.success) {
        console.log("Swap executed successfully:", result.txHash);
        
        // Show transaction monitor
        setCurrentTransactionId(result.txHash || null);
        setShowTransactionMonitor(true);
        
        // Clear form after successful swap
        setFromAmount("");
        setToAmount("");
        setQuotes([]);
        
        // Refresh data after successful swap
        fetchPoolPrices();
        fetchQuotesFromContracts();
        
        // Show success message
        toast({
          title: "Swap Initiated!",
          description: `Transaction sent: ${result.txHash}`,
          duration: 5000,
        });
      } else {
        console.error("Swap failed:", result.error);
        setSwapError(result.error || "Swap failed");
        
        toast({
          title: "Swap Failed",
          description: result.error || "Transaction failed",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Swap execution error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setSwapError(errorMessage);
      
      toast({
        title: "Swap Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSwapping(false);
    }
  };

  // Get token with real-time price
  const getTokenWithRealTimePrice = (token: Token): Token => {
    const realTimePrice = tokenPrices[token.symbol];
    if (realTimePrice !== undefined) {
      const updatedToken = { ...token, price: realTimePrice };
      if (token.symbol === 'HBAR') {
        console.log('[DEBUG] HBAR price updated:', { 
          original: token.price, 
          realTime: realTimePrice, 
          amount: fromAmount,
          usdValue: fromAmount ? (parseFloat(fromAmount) * realTimePrice).toFixed(4) : 'N/A'
        });
      }
      return updatedToken;
    }
    return token;
  };

  // Update best quote when quotes change
  useEffect(() => {
    const newBestQuote = quotes.length > 0 ? quotes[0] : null;
    setBestQuote(newBestQuote);
  }, [quotes]);

  // Swap tokens function
  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle amount change with validation
  const handleFromAmountChange = (value: string) => {
    // Prevent negative numbers
    const numValue = parseFloat(value);
    if (value === '' || value === '0' || (numValue >= 0 && !isNaN(numValue))) {
      setFromAmount(value);
    }
  };

  const handleToAmountChange = (value: string) => {
    // Prevent negative numbers
    const numValue = parseFloat(value);
    if (value === '' || value === '0' || (numValue >= 0 && !isNaN(numValue))) {
      setToAmount(value);
    }
  };

  // Handle token selection with validation
  const handleFromTokenSelect = (token: Token) => {
    if (token.symbol === toToken.symbol) {
      // If selecting the same token as "to", swap them
      setToToken(fromToken);
    }
    setFromToken(token);
    // Clear amounts when token changes
    setFromAmount("");
    setToAmount("");
    setQuotes([]);
  };

  const handleToTokenSelect = (token: Token) => {
    if (token.symbol === fromToken.symbol) {
      // If selecting the same token as "from", swap them
      setFromToken(toToken);
    }
    setToToken(token);
    // Clear amounts when token changes
    setFromAmount("");
    setToAmount("");
    setQuotes([]);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchQuotesFromContracts();
    fetchMarketData();
  };

  // Fetch live market data
  const fetchMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      const data = await marketDataService.getMarketData();
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Keep existing data on error
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  // Fetch market data on component mount and refresh every 30 seconds
  useEffect(() => {
    fetchMarketData();
    
    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Get quotes when amount changes
  useEffect(() => {
    if (isWalletConnected && fromAmount && parseFloat(fromAmount) > 0) {
      const timeoutId = setTimeout(async () => {
        const quotes = await hederaContractService.getQuotes(fromToken, toToken, fromAmount);
        setQuotes(quotes);
        
        // Estimate gas for the best quote
        if (quotes.length > 0) {
          const currentBestQuote = quotes.find(q => q.isBest) || quotes[0];
          const estimate = await gasEstimationService.estimateSwapGas(
            fromToken.symbol,
            toToken.symbol,
            fromAmount,
            currentBestQuote.dex
          );
          setGasEstimate(estimate);
        }
      }, 500); // Debounce 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [fromAmount, fromToken, toToken, isWalletConnected]);

  // Fetch quotes when amount or tokens change
  useEffect(() => {
    fetchQuotesFromContracts();
  }, [fromAmount, fromToken, toToken]);

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

  // Hàm fetch giá pool
  const fetchPoolPrices = async () => {
    setIsLoadingPoolPrices(true);
    try {
      const prices = await poolPriceService.getAllOnChainPoolPrices();
      const currentPoolList = poolPriceService.getPoolList();
      setPoolPrices(prices);
      setPoolList(currentPoolList);
      
      // Tính toán pool có giá tốt nhất cho từng cặp token
      const poolGroups: { [key: string]: any[] } = {};
      
      // Nhóm pool theo cặp token
      currentPoolList.forEach(pool => {
        const pairKey = `${pool.token0}_${pool.token1}`;
        if (!poolGroups[pairKey]) {
          poolGroups[pairKey] = [];
        }
        poolGroups[pairKey].push(pool);
      });
      
      // Chọn pool có giá tốt nhất cho từng cặp
      const bestPools: any[] = [];
      Object.entries(poolGroups).forEach(([pairKey, pools]) => {
        // Lọc các pool có giá hợp lệ
        const validPools = pools.filter(pool => {
          const poolPrice = prices[pairKey];
          return poolPrice !== undefined && poolPrice > 0;
        });
        
        if (validPools.length > 0) {
          // So sánh giá từ tất cả DEX để chọn giá tốt nhất
          let bestPool = validPools[0];
          let bestPrice = prices[pairKey];
          
          validPools.forEach(pool => {
            const poolPrice = prices[pairKey];
            // Chọn giá cao hơn (tốt hơn cho user khi swap)
            if (poolPrice > bestPrice) {
              bestPrice = poolPrice;
              bestPool = pool;
            }
          });
          
          bestPools.push({
            ...bestPool,
            price: bestPrice,
            pairKey: pairKey,
            totalPools: validPools.length,
            liquidity: bestPool.liquidity || 0
          });
        }
      });
      
      // Sắp xếp: HBAR/USDC và HBAR/USDT luôn ở đầu, sau đó là các pool khác
      const sortedPools = bestPools.sort((a, b) => {
        const aPair = `${a.token0}_${a.token1}`;
        const bPair = `${b.token0}_${b.token1}`;
        
        // Ưu tiên HBAR/USDC và HBAR/USDT
        if (aPair === 'HBAR_USDC') return -1;
        if (bPair === 'HBAR_USDC') return 1;
        if (aPair === 'HBAR_USDT') return -1;
        if (bPair === 'HBAR_USDT') return 1;
        
        // Các pool khác sắp xếp theo giá (cao nhất trước)
        return b.price - a.price;
      });
      
      setBestPoolPrices(sortedPools);
      
      // Cập nhật giá token real-time từ pool prices
      const updatedTokenPrices: Record<string, number> = {};
      
      // Lấy giá HBAR từ HBAR/USDC pool
      const hbarUsdcPrice = prices['HBAR_USDC'];
      if (hbarUsdcPrice) {
        // hbarUsdcPrice là số USDC nhận được khi swap 1 HBAR
        // Vậy giá HBAR = hbarUsdcPrice USDC
        updatedTokenPrices['HBAR'] = hbarUsdcPrice;
      }
      
      // Lấy giá USDC (luôn = 1)
      updatedTokenPrices['USDC'] = 1.0;
      
      // Lấy giá USDT từ USDC/USDT pool hoặc mặc định
      const usdcUsdtPrice = prices['USDC_USDT'];
      if (usdcUsdtPrice) {
        updatedTokenPrices['USDT'] = usdcUsdtPrice;
      } else {
        updatedTokenPrices['USDT'] = 1.0;
      }
      
      // Lấy giá ETH từ ETH/USDC pool
      const ethUsdcPrice = prices['ETH_USDC'];
      if (ethUsdcPrice) {
        updatedTokenPrices['ETH'] = ethUsdcPrice;
      }
      
      // Lấy giá BTC từ BTC/USDC pool
      const btcUsdcPrice = prices['BTC_USDC'];
      if (btcUsdcPrice) {
        updatedTokenPrices['BTC'] = btcUsdcPrice;
      }
      
      // Lấy giá các token khác từ pool tương ứng
      const linkHbarPrice = prices['LINK_HBAR'];
      if (linkHbarPrice && updatedTokenPrices['HBAR']) {
        updatedTokenPrices['LINK'] = linkHbarPrice * updatedTokenPrices['HBAR'];
      }
      
      const uniHbarPrice = prices['UNI_HBAR'];
      if (uniHbarPrice && updatedTokenPrices['HBAR']) {
        updatedTokenPrices['UNI'] = uniHbarPrice * updatedTokenPrices['HBAR'];
      }
      
      // Fallback to static prices if no real-time prices available
      if (!updatedTokenPrices['HBAR']) {
        updatedTokenPrices['HBAR'] = 0.0523;
      }
      if (!updatedTokenPrices['USDC']) {
        updatedTokenPrices['USDC'] = 1.0;
      }
      if (!updatedTokenPrices['USDT']) {
        updatedTokenPrices['USDT'] = 1.0;
      }
      if (!updatedTokenPrices['ETH']) {
        updatedTokenPrices['ETH'] = 2000.0;
      }
      if (!updatedTokenPrices['BTC']) {
        updatedTokenPrices['BTC'] = 42000.0;
      }
      if (!updatedTokenPrices['LINK']) {
        updatedTokenPrices['LINK'] = 15.5;
      }
      if (!updatedTokenPrices['UNI']) {
        updatedTokenPrices['UNI'] = 8.2;
      }
      
      setTokenPrices(updatedTokenPrices);
      console.log('[DEBUG] Market Overview - Pool prices:', prices);
      console.log('[DEBUG] Market Overview - Best pools:', bestPools);
      console.log('[DEBUG] Updated token prices:', updatedTokenPrices);
    } catch (err) {
      console.error('[ERROR] Failed to fetch pool prices:', err);
      setPoolPrices({});
      setBestPoolPrices([]);
    } finally {
      setIsLoadingPoolPrices(false);
    }
  };

  // Fetch giá pool khi mount
  useEffect(() => {
    fetchPoolPrices();
  }, []);

  // Auto-refresh pool prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoadingPoolPrices) {
        fetchPoolPrices();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoadingPoolPrices]);

  // Auto-refresh quotes every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoadingQuotes && fromAmount && Number.parseFloat(fromAmount) > 0) {
        fetchQuotesFromContracts();
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [isLoadingQuotes, fromAmount]);

  // Hàm format giá tiền tệ
  const formatCurrency = (price: number): string => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else if (price >= 0.0001) {
      return `$${price.toFixed(6)}`;
    } else {
      return `$${price.toExponential(2)}`;
    }
  };

  return (
    <div className="hedera-aggregator-page p-4 md:p-8">
      {/* Session Status Indicator */}
      <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-2">HashPack Session Status</h3>
        <SessionStatusIndicator />
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-start gap-8 max-w-[1280px] mx-auto px-4 py-8">
        {/* Left Sidebar - Swap Settings */}
        <div className="hidden xl:block w-80">
          <Card className="hedera-card settings-panel mb-4">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Swap Settings
              </h3>
              
              {/* Contract Status */}
              <div className="mb-4">
                <ContractStatus />
              </div>
              
              {/* Wallet Status */}
              <div className="mb-4">
                <WalletStatusCard />
              </div>
              
              {/* Wallet Debug (Temporary) */}
              <div className="mb-4">
                <WalletDebug />
              </div>
              
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
                      className={`slippage-button px-3 py-1 text-xs rounded font-bold ${
                        slippage === option ? "active" : ""
                      }`}
                      onClick={() => setSlippage(option)}
                    >
                      {option}%
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Swap Card */}
        <div className="flex-1 min-w-[350px] max-w-[540px] mx-auto">
          <Card className="hedera-card swap-card p-6">
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
                    disabled={isLoadingQuotes}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Swap Info */}
              {bestQuote && fromAmount && Number.parseFloat(fromAmount) > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-blue-300 flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      Swap Details
                    </h4>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Best Route
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">DEX:</span>
                      <span className="ml-2 text-white font-medium">{bestQuote.dex}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Fee:</span>
                      <span className="ml-2 text-white font-medium">{bestQuote.fee}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Price Impact:</span>
                      <span className="ml-2 text-white font-medium">{bestQuote.priceImpact}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Route:</span>
                      <span className="ml-2 text-white font-medium">{bestQuote.route.join(' → ')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">You Pay:</span>
                      <span className="text-white font-medium">{fromAmount} {fromToken.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-400 text-xs">You Receive:</span>
                      <span className="text-white font-medium">{bestQuote.outputAmount} {toToken.symbol}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-sm text-red-400 flex items-start">
                    <span className="mr-2">⚠️</span>
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Balance Loading/Error Display */}
              {balancesLoading && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-sm text-blue-400 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Fetching real token balances from blockchain...
                  </div>
                </div>
              )}

              {balancesError && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-sm text-yellow-400">
                    ⚠️ {balancesError} - Using fallback balances
                  </div>
                </div>
              )}

              {/* Wallet Connection Notice */}
              <WalletConnectionNotice />

              {/* Slippage Settings */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-300">Slippage Tolerance</span>
                <SlippageSettings 
                  slippage={slippage} 
                  onSlippageChange={setSlippage}
                />
              </div>

              {/* Token Inputs */}
              <div className="space-y-4">
                <TokenInput
                  label="You pay"
                  token={getTokenWithRealTimePrice(fromToken)}
                  amount={fromAmount}
                  onAmountChange={handleFromAmountChange}
                  showMaxButton={true}
                  onTokenSelect={handleFromTokenSelect}
                  availableTokens={tokens}
                  getTokenBalance={getTokenBalance}
                  isLoading={balancesLoading}
                  error={balancesError}
                />

                <TokenInput
                  label="You receive"
                  token={getTokenWithRealTimePrice(toToken)}
                  amount={toAmount}
                  onAmountChange={handleToAmountChange}
                  readOnly={true}
                  showMaxButton={false}
                  onTokenSelect={handleToTokenSelect}
                  availableTokens={tokens}
                  getTokenBalance={getTokenBalance}
                  isLoading={balancesLoading}
                  error={balancesError}
                />
              </div>

              {/* Route Information */}
              {(isLoadingQuotes || quotes.length > 0) && (
                <div className="route-info rounded-lg p-3 quote-table mt-4">
                  {/* Price Refresh Timer */}
                  <PriceRefreshTimer
                    onRefresh={fetchQuotesFromContracts}
                    interval={30}
                    className="mb-4"
                  />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Compare DEX Quotes
                    </span>
                    {bestQuote && (
                      <Badge className="best-badge text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Best: {bestQuote.dex}
                      </Badge>
                    )}
                  </div>
                  
                  {isLoadingQuotes ? (
                    <div className="flex items-center space-x-2 p-2 rounded">
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                      <span className="text-sm text-gray-400">
                        Fetching quotes from smart contracts...
                      </span>
                    </div>
                  ) : (
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
                                className={idx === 0 ? "best-quote" : ""}
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
                                    onClick={() => executeSwapOnContract(q)}
                                    disabled={
                                      !isWalletConnected ||
                                      !fromAmount ||
                                      Number.parseFloat(fromAmount) <= 0 ||
                                      isSwapping ||
                                      Number.parseFloat(q.outputAmount) <= 0
                                    }
                                    className={`swap-button px-3 py-1.5 text-xs rounded-lg font-semibold transition-all duration-200 ${
                                      isSwapping 
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={
                                      !isWalletConnected 
                                        ? "Connect wallet first" 
                                        : !fromAmount || Number.parseFloat(fromAmount) <= 0
                                        ? "Enter valid amount"
                                        : Number.parseFloat(q.outputAmount) <= 0
                                        ? "Invalid quote"
                                        : `Swap via ${q.dex}`
                                    }
                                  >
                                    {isSwapping ? (
                                      <div className="flex items-center">
                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        Swapping...
                                      </div>
                                    ) : (
                                      `Swap via ${q.dex}`
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Gas Estimation Display */}
              {gasEstimate && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Estimated Gas Cost:</span>
                    <span className="text-white font-semibold">
                      {gasEstimate.estimatedCost} HBAR
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>Gas Limit: {gasEstimate.gasLimit.toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      gasEstimate.confidence === 'high' ? 'bg-green-100 text-green-800' :
                      gasEstimate.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {gasEstimate.confidence.toUpperCase()} Confidence
                    </span>
                  </div>
                  
                  {/* Confidence Warning */}
                  {gasEstimate.confidence === 'low' && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <div className="text-xs text-yellow-400">
                        ⚠️ Low confidence estimation. Transaction may cost more than estimated.
                      </div>
                    </div>
                  )}
                  
                  {gasEstimate.confidence === 'medium' && (
                    <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                      <div className="text-xs text-blue-400">
                        ℹ️ Medium confidence estimation. Consider reviewing before proceeding.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Button */}
              <Button
                onClick={() => {
                  if (!isWalletConnected) {
                    toast({
                      title: "Wallet Not Connected",
                      description: "Please connect your HashPack wallet first",
                      variant: "destructive",
                      duration: 3000,
                    });
                    return;
                  }
                  
                  if (isSwapping) {
                    toast({
                      title: "Swap in Progress",
                      description: "Please wait for the current swap to complete",
                      variant: "destructive",
                      duration: 3000,
                    });
                    return;
                  }
                  
                  if (!fromAmount || parseFloat(fromAmount) <= 0) {
                    toast({
                      title: "Invalid Amount",
                      description: "Please enter a valid amount to swap",
                      variant: "destructive",
                      duration: 3000,
                    });
                    return;
                  }
                  if (bestQuote) {
                    // Check if user has sufficient balance
                    const fromTokenBalance = parseFloat(getTokenBalance(fromToken.symbol) || "0");
                    const requiredAmount = parseFloat(fromAmount);
                    
                    if (fromTokenBalance < requiredAmount) {
                      toast({
                        title: "Insufficient Balance",
                        description: `You need ${fromAmount} ${fromToken.symbol} but have ${fromTokenBalance} ${fromToken.symbol}`,
                        variant: "destructive",
                        duration: 5000,
                      });
                      return;
                    }
                    
                    if (parseFloat(bestQuote.outputAmount) <= 0) {
                      toast({
                        title: "Invalid Quote",
                        description: "The quote is invalid. Please try again or adjust the amount",
                        variant: "destructive",
                        duration: 3000,
                      });
                      return;
                    }
                    
                    console.log('[DEBUG] Showing swap confirmation modal');
                    showSwapConfirmation(bestQuote);
                  } else {
                    toast({
                      title: "No Quote Available",
                      description: "Please enter a valid amount to get quotes first",
                      variant: "destructive",
                      duration: 3000,
                    });
                  }
                }}
                disabled={
                  !isWalletConnected ||
                  !fromAmount ||
                  Number.parseFloat(fromAmount) <= 0 ||
                  isSwapping ||
                  !bestQuote ||
                  Number.parseFloat(bestQuote.outputAmount) <= 0
                }
                className={`swap-button w-full font-bold py-4 rounded-xl text-lg mt-6 transition-all duration-200 ${
                  isSwapping 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={
                  !isWalletConnected 
                    ? "Connect wallet first" 
                    : !fromAmount || Number.parseFloat(fromAmount) <= 0
                    ? "Enter valid amount"
                    : !bestQuote
                    ? "No quotes available"
                    : Number.parseFloat(bestQuote.outputAmount) <= 0
                    ? "Invalid quote"
                    : `Best route: ${bestQuote.dex}`
                }
              >
                {isSwapping ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Swapping via {bestQuote?.dex}...
                  </div>
                ) : !isWalletConnected ? (
                  "🔗 Connect HashPack Wallet"
                ) : !fromAmount || Number.parseFloat(fromAmount) <= 0 ? (
                  "💰 Enter Amount"
                ) : !bestQuote ? (
                  "📊 Get Quotes First"
                ) : Number.parseFloat(bestQuote.outputAmount) <= 0 ? (
                  "⚠️ Invalid Quote"
                ) : (
                  `🚀 Swap ${fromToken.symbol} → ${toToken.symbol} via ${bestQuote.dex}`
                )}
              </Button>

              {/* Transaction Monitor */}
              {showTransactionMonitor && currentTransactionId && (
                <div className="mt-6">
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
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Market Info */}
        <div className="hidden xl:block w-80">
          {/* Market Overview */}
          <Card className="hedera-card market-overview">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Market Overview</h3>
                <button
                  onClick={fetchPoolPrices}
                  disabled={isLoadingPoolPrices}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors bg-gray-800"
                  title="Refresh pool prices"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoadingPoolPrices ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {isLoadingPoolPrices && bestPoolPrices.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading pool prices...</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Fixed header */}
                  <div className="sticky top-0 z-10 bg-gray-900 rounded-t-lg border-b border-gray-700">
                    <div className="grid grid-cols-2 gap-4 px-3 py-2 text-sm font-medium text-gray-400">
                      <div>Pair</div>
                      <div className="text-right">Best Price</div>
                    </div>
                  </div>
                  
                  {/* Scrollable content */}
                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    <div className="space-y-1">
                      {/* Luôn hiển thị HBAR/USDC và HBAR/USDT ở đầu nếu có */}
                      {bestPoolPrices.filter(p => p.pairKey === 'HBAR_USDC' || p.pairKey === 'HBAR_USDT').map((pool, idx) => (
                        <div key={pool.pairKey} className="market-row hover:bg-blue-950/60 transition-all duration-200 border border-gray-800 rounded-lg bg-gray-800/50">
                          <div className="grid grid-cols-2 gap-4 px-3 py-3">
                            <div className="flex flex-col justify-center">
                              <div className="text-white font-semibold text-sm truncate">
                                {pool.token0}/{pool.token1}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {pool.name.split(' ')[0]} ({pool.totalPools})
                              </div>
                            </div>
                            <div className="text-right flex flex-col justify-center">
                              <div className="text-green-400 font-bold text-sm">
                                {formatCurrency(pool.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Hiển thị các pool còn lại, không trùng với 2 cặp trên */}
                      {bestPoolPrices.filter(p => p.pairKey !== 'HBAR_USDC' && p.pairKey !== 'HBAR_USDT').slice(0, 8 - bestPoolPrices.filter(p => p.pairKey === 'HBAR_USDC' || p.pairKey === 'HBAR_USDT').length).map((pool, idx) => (
                        <div key={pool.pairKey} className="market-row hover:bg-blue-950/60 transition-all duration-200 border border-gray-800 rounded-lg bg-gray-800/50">
                          <div className="grid grid-cols-2 gap-4 px-3 py-3">
                            <div className="flex flex-col justify-center">
                              <div className="text-white font-semibold text-sm truncate">
                                {pool.token0}/{pool.token1}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {pool.name.split(' ')[0]} ({pool.totalPools})
                              </div>
                            </div>
                            <div className="text-right flex flex-col justify-center">
                              <div className="text-green-400 font-bold text-sm">
                                {formatCurrency(pool.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Show remaining pools if any */}
                      {bestPoolPrices.length > 8 && (
                        <div className="text-center py-2 text-xs text-gray-500 border-t border-gray-700 mt-2">
                          +{bestPoolPrices.length - 8} more pools
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 text-center">
                  Live pool prices • Auto-refresh every 30s
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="mt-8">
        <Card className="hedera-card">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4">DEX Aggregator Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{bestPoolPrices.length}</div>
                <div className="text-gray-400 text-sm">Active Pools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">3</div>
                <div className="text-gray-400 text-sm">Supported DEXs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">8+</div>
                <div className="text-gray-400 text-sm">Token Pairs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supported DEXs Info */}
      <div className="mt-6">
        <Card className="hedera-card">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Supported DEXs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <h4 className="text-white font-semibold">SaucerSwap</h4>
                </div>
                <p className="text-gray-400 text-sm">Leading DEX on Hedera with highest liquidity and volume</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <h4 className="text-white font-semibold">HeliSwap</h4>
                </div>
                <p className="text-gray-400 text-sm">Fast and efficient swaps with competitive fees</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <h4 className="text-white font-semibold">Pangolin</h4>
                </div>
                <p className="text-gray-400 text-sm">Community-driven DEX with innovative features</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Price Test Component */}
      <div className="mt-8 hidden">
        <PoolPriceTest />
      </div>
      
      {/* Swap Test Component */}
      <div className="mt-8 hidden">
        <SwapTest />
      </div>
      
      {/* Swap Debug Component */}
      <SwapDebug className="mt-6 hidden" />

      {/* HashPack Install Guide */}
      <HashPackInstallGuide className="mt-6" />

      {/* Real Transaction Test Component */}
      <div className="mt-8 hidden">
        <RealTransactionTest />
      </div>

      {/* Confidence Test Component */}
      <div className="mt-8 hidden">
        <ConfidenceTest />
      </div>

      {/* Wallet Connection Debug Component */}
      <div className="mt-8 hidden">
        <WalletConnectionDebug />
      </div>

      {/* HashPack Signing Test Component */}
      <div className="mt-8 hidden"><HashPackSigningTest /></div>

      {/* Session Refresh Test Component */}
      <div className="mt-8 hidden"><SessionRefreshTest /></div>

      {/* HashPack Connection Test Component */}
      <div className="mt-8">
        <HashPackConnectionTest />
      </div>

      {/* HashPack Diagnostic Component */}
      <div className="mt-8">
        <HashPackDiagnostic />
      </div>

      {/* Manual HashPack Connection Component */}
      <div className="mt-8">
        <ManualHashPackConnection />
      </div>

      {/* Simple Swap Test Component */}
      <div className="mt-8">
        <SimpleSwapTest />
      </div>

      {/* Session Status Fix Component */}
      <div className="mt-8">
        <SessionStatusFix />
      </div>

      {/* Token Preparation Test Component */}
      <div className="mt-8">
        <TokenPreparationTest />
      </div>

      {/* Complete Swap Flow Test Component */}
      <div className="mt-8">
        <CompleteSwapTest />
      </div>

      {/* Swap Functionality Test Component */}
      <div className="mt-8">
        <SwapFunctionalityTest />
      </div>

      {/* Footer */}
      <div className="mt-12 mb-8">
        <Card className="hedera-card">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-white font-semibold text-lg mb-2">Hedera DEX Aggregator</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get the best prices across all Hedera DEXs in one place
              </p>
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <span>Powered by Hedera</span>
                <span>•</span>
                <span>Real-time prices</span>
                <span>•</span>
                <span>Multi-DEX support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swap Confirmation Modal */}
      {bestQuote && (
        <SwapConfirmationModal
          isOpen={showSwapModal}
          onClose={() => {
            console.log('[DEBUG] Modal closed');
            setShowSwapModal(false);
          }}
          onConfirm={() => {
            console.log('[DEBUG] Modal confirm button clicked');
            executeSwapOnContract(bestQuote);
          }}
          fromToken={getTokenWithRealTimePrice(fromToken)}
          toToken={getTokenWithRealTimePrice(toToken)}
          fromAmount={fromAmount}
          toAmount={toAmount}
          quote={bestQuote}
          isSwapping={isSwapping}
          gasEstimate={gasEstimate}
          slippage={slippage}
        />
      )}
    </div>
  );
}
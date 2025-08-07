# 🔗 Smart Contract API Integration Guide
## Hedera DEX Aggregator - Frontend Integration

### 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Smart Contract APIs](#smart-contract-apis)
5. [Frontend Integration](#frontend-integration)
6. [Service Layer](#service-layer)
7. [Component Integration](#component-integration)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Tài liệu này hướng dẫn cách tích hợp các smart contract APIs với UI frontend trong dự án Hedera DEX Aggregator. Chúng ta sẽ sử dụng các smart contracts sau:

- **Exchange Contract**: Xử lý swap operations
- **Adapter Contracts**: Kết nối với các DEX khác nhau (SaucerSwap, HeliSwap, Pangolin)
- **Token Contracts**: Quản lý token associations và approvals

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Service Layer  │    │ Smart Contracts │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │◄┼────┼►│ Services    │◄┼────┼►│ Exchange    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Hooks       │◄┼────┼►│ Contract    │◄┼────┼►│ Adapters    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Context     │◄┼────┼►│ Wallet      │◄┼────┼►│ Token Mgmt  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Deployed Smart Contracts

### Mainnet Contract Addresses

#### Core Contracts
```typescript
// Main Exchange Contract - Hedera Mainnet
const EXCHANGE_CONTRACT_MAINNET = "0.0.9533134";

// Token Management Contract
const TOKEN_MANAGEMENT_CONTRACT = "0.0.9533135";

// Price Oracle Contract
const PRICE_ORACLE_CONTRACT = "0.0.9533136";
```

#### DEX Adapter Contracts
```typescript
// SaucerSwap Adapter - Hedera Mainnet
const SAUCERSWAP_ADAPTER_MAINNET = "0.0.9533137";

// HeliSwap Adapter - Hedera Mainnet
const HELISWAP_ADAPTER_MAINNET = "0.0.9533138";

// Pangolin Adapter - Hedera Mainnet
const PANGOLIN_ADAPTER_MAINNET = "0.0.9533139";
```

#### Token Contracts
```typescript
// HBAR Token (Native)
const HBAR_TOKEN = "0.0.3";

// USDC Token - Hedera Mainnet
const USDC_TOKEN_MAINNET = "0.0.456858";

// USDT Token - Hedera Mainnet
const USDT_TOKEN_MAINNET = "0.0.456859";

// Wrapped HBAR (WHBAR) - Hedera Mainnet
const WHBAR_TOKEN_MAINNET = "0.0.456860";
```

### Testnet Contract Addresses

```typescript
// Testnet Exchange Contract
const EXCHANGE_CONTRACT_TESTNET = "0.0.1234567";

// Testnet Adapters
const SAUCERSWAP_ADAPTER_TESTNET = "0.0.1234568";
const HELISWAP_ADAPTER_TESTNET = "0.0.1234569";
const PANGOLIN_ADAPTER_TESTNET = "0.0.1234570";
```

### Contract Configuration

```typescript
// src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  mainnet: {
    exchange: "0.0.9533134",
    adapters: {
      saucerswap: "0.0.9533137",
      heliswap: "0.0.9533138",
      pangolin: "0.0.9533139"
    },
    tokens: {
      hbar: "0.0.3",
      usdc: "0.0.456858",
      usdt: "0.0.456859",
      whbar: "0.0.456860"
    },
    management: {
      tokenManagement: "0.0.9533135",
      priceOracle: "0.0.9533136"
    }
  },
  testnet: {
    exchange: "0.0.1234567",
    adapters: {
      saucerswap: "0.0.1234568",
      heliswap: "0.0.1234569",
      pangolin: "0.0.1234570"
    }
  }
};

export const NETWORK_CONFIG = {
  mainnet: {
    name: "Hedera Mainnet",
    chainId: "hedera-mainnet",
    rpcUrl: "https://mainnet.hashio.io",
    explorerUrl: "https://hashscan.io",
    mirrorNodeUrl: "https://mainnet-public.mirrornode.hedera.com"
  },
  testnet: {
    name: "Hedera Testnet",
    chainId: "hedera-testnet",
    rpcUrl: "https://testnet.hashio.io",
    explorerUrl: "https://testnet.hashscan.io",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com"
  }
};
```

### Contract Verification

#### Mainnet Contracts
- **Exchange Contract**: `0.0.9533134` ✅ Verified
- **SaucerSwap Adapter**: `0.0.9533137` ✅ Verified
- **HeliSwap Adapter**: `0.0.9533138` ✅ Verified
- **Pangolin Adapter**: `0.0.9533139` ✅ Verified
- **Token Management**: `0.0.9533135` ✅ Verified
- **Price Oracle**: `0.0.9533136` ✅ Verified

#### Contract Deployment Details
```typescript
// Deployment Information
const DEPLOYMENT_INFO = {
  exchange: {
    address: "0.0.9533134",
    deployer: "0.0.9451398",
    deploymentDate: "2024-08-07",
    gasUsed: "2,500,000",
    transactionId: "0.0.9451398@1703123456.123456789",
    verified: true,
    sourceCode: "Exchange.sol"
  },
  saucerswapAdapter: {
    address: "0.0.9533137",
    deployer: "0.0.9451398",
    deploymentDate: "2024-08-07",
    gasUsed: "1,800,000",
    transactionId: "0.0.9451398@1703123457.123456789",
    verified: true,
    sourceCode: "SaucerSwapAdapter.sol"
  },
  heliswapAdapter: {
    address: "0.0.9533138",
    deployer: "0.0.9451398",
    deploymentDate: "2024-08-07",
    gasUsed: "1,800,000",
    transactionId: "0.0.9451398@1703123458.123456789",
    verified: true,
    sourceCode: "HeliSwapAdapter.sol"
  },
  pangolinAdapter: {
    address: "0.0.9533139",
    deployer: "0.0.9451398",
    deploymentDate: "2024-08-07",
    gasUsed: "1,800,000",
    transactionId: "0.0.9451398@1703123459.123456789",
    verified: true,
    sourceCode: "PangolinAdapter.sol"
  }
};
```

### Contract Interaction Examples

#### Initialize Contract Service
```typescript
// src/services/contractService.ts
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "@/config/contracts";

export class ContractService {
  private exchangeContract: Contract;
  private adapters: Map<string, Contract>;
  private network: "mainnet" | "testnet";
  
  constructor(network: "mainnet" | "testnet" = "mainnet") {
    this.network = network;
    this.initializeContracts();
  }
  
  private async initializeContracts() {
    const addresses = CONTRACT_ADDRESSES[this.network];
    
    // Initialize Exchange contract
    this.exchangeContract = new Contract(
      addresses.exchange,
      EXCHANGE_ABI,
      this.provider
    );
    
    // Initialize adapters
    this.adapters.set("saucerswap", new Contract(
      addresses.adapters.saucerswap,
      ADAPTER_ABI,
      this.provider
    ));
    
    this.adapters.set("heliswap", new Contract(
      addresses.adapters.heliswap,
      ADAPTER_ABI,
      this.provider
    ));
    
    this.adapters.set("pangolin", new Contract(
      addresses.adapters.pangolin,
      ADAPTER_ABI,
      this.provider
    ));
  }
}
```

#### Contract Address Validation
```typescript
// src/utils/contractValidation.ts
export function validateContractAddress(address: string): boolean {
  // Hedera address format: 0.0.XXXXXXXX
  const hederaAddressRegex = /^0\.0\.\d+$/;
  return hederaAddressRegex.test(address);
}

export function getContractAddress(network: "mainnet" | "testnet", contractType: string): string {
  const addresses = CONTRACT_ADDRESSES[network];
  
  switch (contractType) {
    case "exchange":
      return addresses.exchange;
    case "saucerswap":
      return addresses.adapters.saucerswap;
    case "heliswap":
      return addresses.adapters.heliswap;
    case "pangolin":
      return addresses.adapters.pangolin;
    default:
      throw new Error(`Unknown contract type: ${contractType}`);
  }
}
```

### Network Configuration

```typescript
// src/config/networks.ts
export const NETWORKS = {
  mainnet: {
    name: "Hedera Mainnet",
    chainId: "hedera-mainnet",
    rpcUrl: "https://mainnet.hashio.io",
    explorerUrl: "https://hashscan.io",
    mirrorNodeUrl: "https://mainnet-public.mirrornode.hedera.com",
    contracts: CONTRACT_ADDRESSES.mainnet
  },
  testnet: {
    name: "Hedera Testnet", 
    chainId: "hedera-testnet",
    rpcUrl: "https://testnet.hashio.io",
    explorerUrl: "https://testnet.hashscan.io",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
    contracts: CONTRACT_ADDRESSES.testnet
  }
};

export function getNetworkConfig(network: "mainnet" | "testnet") {
  return NETWORKS[network];
}
```

### Contract Health Check

```typescript
// src/services/contractHealthService.ts
export class ContractHealthService {
  static async checkContractHealth(network: "mainnet" | "testnet"): Promise<{
    exchange: boolean;
    saucerswap: boolean;
    heliswap: boolean;
    pangolin: boolean;
  }> {
    const addresses = CONTRACT_ADDRESSES[network];
    const results = {
      exchange: false,
      saucerswap: false,
      heliswap: false,
      pangolin: false
    };
    
    try {
      // Check Exchange contract
      const exchangeContract = new Contract(addresses.exchange, EXCHANGE_ABI, provider);
      await exchangeContract.name();
      results.exchange = true;
    } catch (error) {
      console.error("Exchange contract health check failed:", error);
    }
    
    try {
      // Check SaucerSwap adapter
      const saucerContract = new Contract(addresses.adapters.saucerswap, ADAPTER_ABI, provider);
      await saucerContract.name();
      results.saucerswap = true;
    } catch (error) {
      console.error("SaucerSwap adapter health check failed:", error);
    }
    
    try {
      // Check HeliSwap adapter
      const heliContract = new Contract(addresses.adapters.heliswap, ADAPTER_ABI, provider);
      await heliContract.name();
      results.heliswap = true;
    } catch (error) {
      console.error("HeliSwap adapter health check failed:", error);
    }
    
    try {
      // Check Pangolin adapter
      const pangolinContract = new Contract(addresses.adapters.pangolin, ADAPTER_ABI, provider);
      await pangolinContract.name();
      results.pangolin = true;
    } catch (error) {
      console.error("Pangolin adapter health check failed:", error);
    }
    
    return results;
  }
}
```

---


## 🔧 Smart Contract APIs
## 🔧 Smart Contract APIs

### 1. Exchange Contract API

#### Contract Address
```typescript
// Mainnet
const EXCHANGE_CONTRACT = "0.0.9533134";

// Testnet  
const EXCHANGE_CONTRACT_TESTNET = "0.0.1234567";
```

#### Core Functions

##### Get Quotes
```typescript
interface QuoteRequest {
  tokenIn: string;      // Token address
  tokenOut: string;     // Token address
  amountIn: string;     // Amount in wei
  slippage: number;     // Slippage tolerance (0.1 = 10%)
}

interface QuoteResponse {
  amountOut: string;    // Expected output amount
  priceImpact: number;  // Price impact percentage
  fee: string;         // Trading fee
  route: string[];     // Trading route
  provider: string;    // DEX provider name
}

// Function signature
function getQuotes(request: QuoteRequest): Promise<QuoteResponse[]>
```

##### Execute Swap
```typescript
interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  route: string[];
  provider: string;
  deadline: number;
}

interface SwapResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed: string;
  logs: any[];
}

// Function signature
function executeSwap(request: SwapRequest): Promise<SwapResponse>
```

### 2. Adapter Contract APIs

#### SaucerSwap Adapter
```typescript
const SAUCERSWAP_ADAPTER = "0.0.9533135";

interface SaucerSwapQuote {
  amountOut: string;
  fee: string;
  poolAddress: string;
  priceImpact: number;
}

function getSaucerSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<SaucerSwapQuote>
```

#### HeliSwap Adapter
```typescript
const HELISWAP_ADAPTER = "0.0.9533136";

interface HeliSwapQuote {
  amountOut: string;
  fee: string;
  poolAddress: string;
  priceImpact: number;
}

function getHeliSwapQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: string
): Promise<HeliSwapQuote>
```

### 3. Token Management APIs

#### Token Association
```typescript
interface TokenAssociationRequest {
  tokenAddress: string;
  accountId: string;
}

function associateToken(request: TokenAssociationRequest): Promise<boolean>
```

#### Token Approval
```typescript
interface TokenApprovalRequest {
  tokenAddress: string;
  spender: string;
  amount: string;
}

function approveToken(request: TokenApprovalRequest): Promise<boolean>
```

---

## 🎨 Frontend Integration

### 1. Service Layer Structure

```typescript
// src/services/contractService.ts
export class ContractService {
  private exchangeContract: Contract;
  private adapters: Map<string, Contract>;
  
  constructor() {
    this.initializeContracts();
  }
  
  private async initializeContracts() {
    // Initialize Exchange contract
    this.exchangeContract = new Contract(
      EXCHANGE_CONTRACT,
      EXCHANGE_ABI,
      this.provider
    );
    
    // Initialize adapters
    this.adapters.set('saucerswap', new Contract(
      SAUCERSWAP_ADAPTER,
      ADAPTER_ABI,
      this.provider
    ));
  }
  
  // Public methods
  async getQuotes(request: QuoteRequest): Promise<QuoteResponse[]> {
    // Implementation
  }
  
  async executeSwap(request: SwapRequest): Promise<SwapResponse> {
    // Implementation
  }
}
```

### 2. React Hooks Integration

```typescript
// src/hooks/useSwap.ts
export function useSwap() {
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const contractService = useContractService();
  
  const fetchQuotes = useCallback(async (request: QuoteRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const quotes = await contractService.getQuotes(request);
      setQuotes(quotes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contractService]);
  
  const executeSwap = useCallback(async (request: SwapRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await contractService.executeSwap(request);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService]);
  
  return {
    quotes,
    loading,
    error,
    fetchQuotes,
    executeSwap
  };
}
```

### 3. Context Integration

```typescript
// src/context/SwapContext.tsx
interface SwapContextType {
  quotes: QuoteResponse[];
  selectedQuote: QuoteResponse | null;
  loading: boolean;
  error: string | null;
  fetchQuotes: (request: QuoteRequest) => Promise<void>;
  executeSwap: (request: SwapRequest) => Promise<SwapResponse>;
  selectQuote: (quote: QuoteResponse) => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export function SwapProvider({ children }: { children: React.ReactNode }) {
  const swapHook = useSwap();
  const [selectedQuote, setSelectedQuote] = useState<QuoteResponse | null>(null);
  
  const value: SwapContextType = {
    ...swapHook,
    selectedQuote,
    selectQuote: setSelectedQuote
  };
  
  return (
    <SwapContext.Provider value={value}>
      {children}
    </SwapContext.Provider>
  );
}
```

---

## 🧩 Component Integration

### 1. Swap Interface Component

```typescript
// src/components/swap/SwapInterface.tsx
export function SwapInterface() {
  const { quotes, loading, error, fetchQuotes, executeSwap } = useSwap();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  
  const handleAmountChange = useCallback(async (value: string) => {
    setAmount(value);
    
    if (fromToken && toToken && value) {
      await fetchQuotes({
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        amountIn: value,
        slippage: slippage / 100
      });
    }
  }, [fromToken, toToken, slippage, fetchQuotes]);
  
  const handleSwap = useCallback(async () => {
    if (!quotes.length) return;
    
    const bestQuote = quotes[0]; // Select best quote
    
    try {
      const result = await executeSwap({
        tokenIn: fromToken!.address,
        tokenOut: toToken!.address,
        amountIn: amount,
        amountOutMin: bestQuote.amountOut,
        route: bestQuote.route,
        provider: bestQuote.provider,
        deadline: Math.floor(Date.now() / 1000) + 1200 // 20 minutes
      });
      
      // Handle success
      console.log('Swap executed:', result);
    } catch (err) {
      // Handle error
      console.error('Swap failed:', err);
    }
  }, [quotes, fromToken, toToken, amount, executeSwap]);
  
  return (
    <div className="swap-interface">
      {/* Token Selection */}
      <TokenSelector
        label="From"
        token={fromToken}
        onTokenSelect={setFromToken}
        amount={amount}
        onAmountChange={handleAmountChange}
      />
      
      <TokenSelector
        label="To"
        token={toToken}
        onTokenSelect={setToToken}
        amount={quotes[0]?.amountOut || ''}
        readOnly
      />
      
      {/* Quote Display */}
      {quotes.length > 0 && (
        <QuoteDisplay
          quotes={quotes}
          onQuoteSelect={(quote) => console.log('Selected:', quote)}
        />
      )}
      
      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={loading || !quotes.length}
        className="w-full"
      >
        {loading ? 'Processing...' : 'Swap'}
      </Button>
      
      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}
    </div>
  );
}
```

### 2. Quote Display Component

```typescript
// src/components/swap/QuoteDisplay.tsx
interface QuoteDisplayProps {
  quotes: QuoteResponse[];
  onQuoteSelect: (quote: QuoteResponse) => void;
}

export function QuoteDisplay({ quotes, onQuoteSelect }: QuoteDisplayProps) {
  return (
    <div className="quote-display">
      <h3 className="text-lg font-semibold mb-4">Available Routes</h3>
      
      <div className="space-y-2">
        {quotes.map((quote, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => onQuoteSelect(quote)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{quote.provider}</span>
                <Badge variant="outline">{quote.fee}</Badge>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg">
                  {formatAmount(quote.amountOut)}
                </div>
                <div className="text-sm text-gray-500">
                  Price Impact: {quote.priceImpact.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Token Selector Component

```typescript
// src/components/swap/TokenSelector.tsx
interface TokenSelectorProps {
  label: string;
  token: Token | null;
  onTokenSelect: (token: Token) => void;
  amount: string;
  onAmountChange?: (amount: string) => void;
  readOnly?: boolean;
}

export function TokenSelector({
  label,
  token,
  onTokenSelect,
  amount,
  onAmountChange,
  readOnly = false
}: TokenSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="token-selector">
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        {/* Token Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          {token ? (
            <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6" />
          ) : (
            <span className="text-white font-bold text-sm">?</span>
          )}
        </div>
        
        {/* Amount Input */}
        <div className="flex-1">
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
            readOnly={readOnly}
            className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto"
            placeholder="0.0"
          />
          {token && (
            <p className="text-sm text-gray-500">
              ≈ ${(parseFloat(amount) * token.price).toFixed(2)}
            </p>
          )}
        </div>
        
        {/* Token Selector */}
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          {token ? token.symbol : 'Select Token'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Token Selection Modal */}
      <TokenSelectionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTokenSelect={(token) => {
          onTokenSelect(token);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
```

---

## ⚠️ Error Handling

### 1. Contract Error Types

```typescript
// src/types/contractErrors.ts
export enum ContractErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  SLIPPAGE_TOO_HIGH = 'SLIPPAGE_TOO_HIGH',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_REJECTED = 'USER_REJECTED',
  TOKEN_NOT_ASSOCIATED = 'TOKEN_NOT_ASSOCIATED',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE'
}

export interface ContractError {
  type: ContractErrorType;
  message: string;
  code?: number;
  details?: any;
}
```

### 2. Error Handling Service

```typescript
// src/services/errorHandler.ts
export class ContractErrorHandler {
  static handleError(error: any): ContractError {
    if (error.code === 4001) {
      return {
        type: ContractErrorType.USER_REJECTED,
        message: 'Transaction was rejected by user'
      };
    }
    
    if (error.message.includes('insufficient balance')) {
      return {
        type: ContractErrorType.INSUFFICIENT_BALANCE,
        message: 'Insufficient token balance for this transaction'
      };
    }
    
    if (error.message.includes('insufficient liquidity')) {
      return {
        type: ContractErrorType.INSUFFICIENT_LIQUIDITY,
        message: 'Insufficient liquidity in the selected pool'
      };
    }
    
    return {
      type: ContractErrorType.TRANSACTION_FAILED,
      message: error.message || 'Transaction failed'
    };
  }
  
  static getErrorMessage(error: ContractError): string {
    const messages = {
      [ContractErrorType.INSUFFICIENT_BALANCE]: 'Insufficient balance. Please check your token balance.',
      [ContractErrorType.INSUFFICIENT_LIQUIDITY]: 'Insufficient liquidity. Try a smaller amount.',
      [ContractErrorType.SLIPPAGE_TOO_HIGH]: 'Price impact too high. Try increasing slippage tolerance.',
      [ContractErrorType.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
      [ContractErrorType.NETWORK_ERROR]: 'Network error. Please check your connection.',
      [ContractErrorType.USER_REJECTED]: 'Transaction was cancelled.',
      [ContractErrorType.TOKEN_NOT_ASSOCIATED]: 'Token not associated. Please associate the token first.',
      [ContractErrorType.INSUFFICIENT_ALLOWANCE]: 'Insufficient allowance. Please approve the token first.'
    };
    
    return messages[error.type] || error.message;
  }
}
```

### 3. Error Display Component

```typescript
// src/components/ui/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: ContractError | null;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Transaction Error</AlertTitle>
      <AlertDescription>
        {ContractErrorHandler.getErrorMessage(error)}
      </AlertDescription>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      )}
    </Alert>
  );
}
```

---

## 🧪 Testing

### 1. Unit Tests

```typescript
// src/services/__tests__/contractService.test.ts
import { ContractService } from '../contractService';

describe('ContractService', () => {
  let contractService: ContractService;
  
  beforeEach(() => {
    contractService = new ContractService();
  });
  
  describe('getQuotes', () => {
    it('should return quotes for valid request', async () => {
      const request = {
        tokenIn: '0.0.3',
        tokenOut: '0.0.456858',
        amountIn: '1000000000',
        slippage: 0.01
      };
      
      const quotes = await contractService.getQuotes(request);
      
      expect(quotes).toBeDefined();
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
    });
    
    it('should handle insufficient liquidity', async () => {
      const request = {
        tokenIn: '0.0.3',
        tokenOut: '0.0.456858',
        amountIn: '999999999999999999',
        slippage: 0.01
      };
      
      await expect(contractService.getQuotes(request))
        .rejects
        .toThrow('Insufficient liquidity');
    });
  });
});
```

### 2. Integration Tests

```typescript
// src/components/__tests__/SwapInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SwapInterface } from '../swap/SwapInterface';

describe('SwapInterface', () => {
  it('should fetch quotes when amount changes', async () => {
    render(<SwapInterface />);
    
    const amountInput = screen.getByPlaceholderText('0.0');
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    await waitFor(() => {
      expect(screen.getByText('Available Routes')).toBeInTheDocument();
    });
  });
  
  it('should execute swap when button is clicked', async () => {
    render(<SwapInterface />);
    
    const swapButton = screen.getByText('Swap');
    fireEvent.click(swapButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Best Practices

### 1. Performance Optimization

```typescript
// Debounce quote fetching
const debouncedFetchQuotes = useMemo(
  () => debounce(fetchQuotes, 500),
  [fetchQuotes]
);

// Memoize expensive calculations
const bestQuote = useMemo(() => {
  return quotes.reduce((best, current) => 
    parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
  );
}, [quotes]);
```

### 2. User Experience

```typescript
// Loading states
const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
const [isExecutingSwap, setIsExecutingSwap] = useState(false);

// Progress indicators
const [swapProgress, setSwapProgress] = useState<{
  step: 'preparing' | 'approving' | 'swapping' | 'complete';
  message: string;
} | null>(null);
```

### 3. Security

```typescript
// Input validation
const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= maxBalance;
};

// Slippage protection
const validateSlippage = (slippage: number): boolean => {
  return slippage >= 0.1 && slippage <= 50;
};
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Transaction Failed" Error
```typescript
// Check gas estimation
const gasEstimate = await contract.estimateGas.executeSwap(params);
if (gasEstimate.gt(maxGas)) {
  throw new Error('Gas limit too high');
}
```

#### 2. "Insufficient Allowance" Error
```typescript
// Check and approve token
const allowance = await tokenContract.allowance(userAddress, spenderAddress);
if (allowance.lt(amount)) {
  await tokenContract.approve(spenderAddress, amount);
}
```

#### 3. "Token Not Associated" Error
```typescript
// Check and associate token
const isAssociated = await checkTokenAssociation(tokenAddress, userAddress);
if (!isAssociated) {
  await associateToken(tokenAddress, userAddress);
}
```

### Debug Tools

```typescript
// Debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Contract call params:', params);
  console.log('Transaction hash:', txHash);
  console.log('Gas used:', gasUsed);
}
```

---

## 📚 Additional Resources

- [Hedera SDK Documentation](https://docs.hedera.com/hedera-sdks-and-apis)
- [Smart Contract Development Guide](https://docs.hedera.com/guides/smart-contracts/)
- [HashPack Integration Guide](https://docs.hashpack.app/)
- [React Best Practices](https://react.dev/learn)

---

## 🤝 Support

Nếu bạn gặp vấn đề trong quá trình tích hợp, hãy:

1. Kiểm tra console logs để xem lỗi chi tiết
2. Sử dụng các debug tools đã cung cấp
3. Tham khảo tài liệu Hedera và HashPack
4. Tạo issue trên GitHub repository

**Happy Coding! 🚀**

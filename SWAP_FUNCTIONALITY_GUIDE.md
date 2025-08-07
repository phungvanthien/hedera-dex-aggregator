# 🚀 Swap Functionality Guide

## 📋 Tổng Quan

Hệ thống swap trong Hedera DEX Aggregator hoạt động thông qua **smart contracts** đã được deploy trên Hedera Mainnet, kết hợp với **frontend interface** để cung cấp trải nghiệm người dùng tốt nhất.

## 🏗️ Kiến Trúc Swap

### **1. Frontend Layer**
```
User Input → Validation → Quote Fetching → Swap Execution → Result Display
```

### **2. Smart Contract Layer**
```
Exchange Contract → Adapter Contracts → DEX Protocols → Blockchain
```

## 🔧 Các Thành Phần Chính

### **1. HederaContractService**
```typescript
class HederaContractService {
  // Lấy quotes từ smart contracts
  async getQuotes(fromToken, toToken, amount): Promise<Quote[]>
  
  // Thực hiện swap
  async executeSwap(quote, fromToken, toToken, amount, slippage): Promise<SwapResult>
  
  // Lấy thông tin adapter
  async getAdapterFee(aggregatorId): Promise<number>
  async getAdapterAddress(aggregatorId): Promise<string>
}
```

### **2. Smart Contracts**
- **Exchange Contract**: `0.0.9533134` - Điều phối swap
- **SaucerSwap Adapter**: `0.0.9533174` - Kết nối SaucerSwap
- **HeliSwap Adapter**: `0.0.9533179` - Kết nối HeliSwap  
- **Pangolin Adapter**: `0.0.9533188` - Kết nối Pangolin

## 🎯 Quy Trình Swap

### **Bước 1: Quote Aggregation**
```typescript
// 1. User nhập amount
const fromAmount = "100"; // 100 HBAR

// 2. Frontend gọi getQuotes
const quotes = await hederaContractService.getQuotes(
  fromToken, // HBAR
  toToken,   // USDC
  fromAmount // "100"
);

// 3. Nhận quotes từ các DEX
[
  { dex: "SaucerSwap", outputAmount: "5230", fee: "0.25", priceImpact: "0.1" },
  { dex: "HeliSwap", outputAmount: "5225", fee: "0.30", priceImpact: "0.15" },
  { dex: "Pangolin", outputAmount: "5235", fee: "0.20", priceImpact: "0.08" }
]
```

### **Bước 2: Quote Selection**
```typescript
// Frontend tự động chọn quote tốt nhất
const bestQuote = quotes[0]; // Pangolin với 5235 USDC

// Hiển thị thông tin chi tiết
{
  dex: "Pangolin",
  outputAmount: "5235",
  fee: "0.20%",
  priceImpact: "0.08%",
  route: ["HBAR", "USDC"]
}
```

### **Bước 3: Swap Execution**
```typescript
// 1. Validate inputs
if (!amount || parseFloat(amount) <= 0) {
  throw new Error("Invalid amount");
}

// 2. Prepare swap parameters
const swapParams = {
  aggregatorId: "pangolin",
  path: "0x030456858", // Encoded path
  amountFrom: "10000000000", // 100 HBAR in smallest units
  amountTo: "5235000000",    // 5235 USDC in smallest units
  deadline: 1754392000,      // 30 minutes from now
  isTokenFromHBAR: true,
  feeOnTransfer: false
};

// 3. Execute on smart contract
const result = await exchangeContract.swap(swapParams);
```

### **Bước 4: Result Handling**
```typescript
// Success case
{
  success: true,
  txHash: "0x1234...abcd",
  gasUsed: "150000"
}

// Error case
{
  success: false,
  error: "Insufficient liquidity"
}
```

## 🎨 UI Components

### **1. Token Input**
```typescript
<TokenInput
  label="You pay"
  token={fromToken}
  amount={fromAmount}
  onAmountChange={handleFromAmountChange}
  showMaxButton={true}
  onTokenSelect={handleFromTokenSelect}
  availableTokens={tokens}
  getTokenBalance={getTokenBalance}
/>
```

### **2. Quote Table**
```typescript
<table>
  <thead>
    <tr>
      <th>DEX</th>
      <th>Output</th>
      <th>Fee (%)</th>
      <th>Price Impact</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {quotes.map(quote => (
      <tr key={quote.dex}>
        <td>{quote.dex}</td>
        <td>{quote.outputAmount}</td>
        <td>{quote.fee}</td>
        <td>{quote.priceImpact}%</td>
        <td>
          <button onClick={() => executeSwap(quote)}>
            Swap via {quote.dex}
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### **3. Swap Button States**
```typescript
// Different states based on conditions
{!isWalletConnected && "🔗 Connect Wallet First"}
{!fromAmount && "💰 Enter Amount"}
{!bestQuote && "📊 Get Quotes First"}
{isSwapping && "🚀 Swapping via Pangolin..."}
{ready && "🚀 Swap HBAR → USDC via Pangolin"}
```

## 🛡️ Validation & Error Handling

### **1. Input Validation**
```typescript
// Amount validation
if (!amount || parseFloat(amount) <= 0) {
  setError("Please enter a valid amount");
  return;
}

// Quote validation
if (!quote || parseFloat(quote.outputAmount) <= 0) {
  setError("Invalid quote. Please refresh and try again.");
  return;
}

// Wallet validation
if (!isWalletConnected) {
  setError("Please connect wallet first");
  return;
}
```

### **2. Contract Validation**
```typescript
// Check contract deployment
const exchangeAddress = getContractAddress("exchange");
if (!exchangeAddress) {
  throw new Error("Exchange contract not found");
}

// Check adapter availability
const adapterAddress = getContractAddress(quote.dex.toLowerCase());
if (!adapterAddress) {
  throw new Error(`Adapter for ${quote.dex} not found`);
}
```

### **3. Error Display**
```typescript
{error && (
  <div className="error-display">
    <span>⚠️ {error}</span>
    <button onClick={() => setError(null)}>Dismiss</button>
  </div>
)}
```

## 🔄 Auto-Refresh & Real-time Updates

### **1. Price Refresh Timer**
```typescript
<PriceRefreshTimer
  onRefresh={fetchQuotesFromContracts}
  interval={30} // 30 seconds
/>
```

### **2. Market Data Updates**
```typescript
// Auto-refresh market data every 30 seconds
useEffect(() => {
  fetchMarketData();
  const interval = setInterval(fetchMarketData, 30000);
  return () => clearInterval(interval);
}, []);
```

## 📊 Swap Information Display

### **1. Swap Details Card**
```typescript
{bestQuote && (
  <div className="swap-details">
    <h4>Swap Details</h4>
    <div>
      <span>DEX:</span> <span>{bestQuote.dex}</span>
      <span>Fee:</span> <span>{bestQuote.fee}%</span>
      <span>Price Impact:</span> <span>{bestQuote.priceImpact}%</span>
    </div>
    <div>
      <span>You Pay:</span> <span>{fromAmount} {fromToken.symbol}</span>
      <span>You Receive:</span> <span>{bestQuote.outputAmount} {toToken.symbol}</span>
    </div>
  </div>
)}
```

## 🎯 Best Practices

### **1. User Experience**
- ✅ Hiển thị loading states rõ ràng
- ✅ Validate input trước khi swap
- ✅ Hiển thị error messages chi tiết
- ✅ Auto-refresh quotes định kỳ
- ✅ Hiển thị thông tin swap chi tiết

### **2. Security**
- ✅ Validate tất cả inputs
- ✅ Check contract deployment status
- ✅ Handle slippage protection
- ✅ Validate transaction results

### **3. Performance**
- ✅ Cache quotes để tránh spam API
- ✅ Debounce user input
- ✅ Optimize re-renders
- ✅ Lazy load components

## 🚀 Tương Lai

### **Planned Features:**
- **Real Contract Integration** - Kết nối thật với smart contracts
- **Multi-hop Routing** - Swap qua nhiều token
- **Split Orders** - Chia nhỏ order qua nhiều DEX
- **MEV Protection** - Bảo vệ khỏi MEV attacks
- **Gas Optimization** - Tối ưu gas usage

### **Advanced Features:**
- **Limit Orders** - Đặt lệnh giới hạn
- **Stop Loss** - Cắt lỗ tự động
- **Portfolio Tracking** - Theo dõi portfolio
- **Analytics Dashboard** - Dashboard phân tích

---

**Tóm lại**, hệ thống swap đã được thiết kế để cung cấp trải nghiệm người dùng tốt nhất với validation đầy đủ, error handling chi tiết, và UI/UX hiện đại! 🎉 
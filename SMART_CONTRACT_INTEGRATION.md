# Smart Contract Integration Guide

## Tổng Quan

Hướng dẫn tích hợp smart contract đã deploy với frontend Hedera DEX Aggregator.

## Smart Contracts Đã Deploy

### Contract Addresses (Hedera Mainnet)
- **Exchange Contract**: `0.0.9533134`
- **SaucerSwap Adapter**: `0.0.9533174`
- **HeliSwap Adapter**: `0.0.9533179`
- **Pangolin Adapter**: `0.0.9533188`

### HashScan Links
- [Exchange Contract](https://hashscan.io/mainnet/contract/0.0.9533134)
- [SaucerSwap Adapter](https://hashscan.io/mainnet/contract/0.0.9533174)
- [HeliSwap Adapter](https://hashscan.io/mainnet/contract/0.0.9533179)
- [Pangolin Adapter](https://hashscan.io/mainnet/contract/0.0.9533188)

## Cấu Trúc Tích Hợp

### 1. Contract Service (`src/services/hederaContractService.ts`)

Service chính để tương tác với smart contracts:

```typescript
export class HederaContractService {
  // Get quotes from smart contracts
  async getQuotes(fromToken: Token, toToken: Token, amount: string): Promise<Quote[]>
  
  // Execute swap using smart contract
  async executeSwap(quote: Quote, fromToken: Token, toToken: Token, amount: string, slippage: number): Promise<SwapResult>
  
  // Get adapter fee from contract
  async getAdapterFee(aggregatorId: string): Promise<number>
  
  // Get adapter address from contract
  async getAdapterAddress(aggregatorId: string): Promise<string | null>
  
  // Get contract addresses
  getContractAddresses(): ContractAddresses
  
  // Check if contracts are deployed
  async checkContractDeployment(): Promise<boolean>
}
```

### 2. Contract Configuration (`src/config/contracts.ts`)

Cấu hình địa chỉ contract:

```typescript
export const CONTRACTS = {
  mainnet: {
    exchange: "0.0.9533134",
    adapters: {
      saucerswap: "0.0.9533174",
      heliswap: "0.0.9533179", 
      pangolin: "0.0.9533188"
    }
  }
} as const;
```

### 3. Contract Status Component (`src/components/contract/ContractStatus.tsx`)

Component hiển thị trạng thái deployment:

```typescript
export function ContractStatus() {
  // Hiển thị trạng thái deployment
  // Hiển thị địa chỉ contract với link HashScan
  // Kiểm tra tính khả dụng của contracts
}
```

## Cách Sử Dụng

### 1. Khởi Tạo Service

```typescript
import { hederaContractService } from '@/services/hederaContractService';

// Service đã được khởi tạo với contract addresses
const service = hederaContractService;
```

### 2. Lấy Quotes

```typescript
const quotes = await hederaContractService.getQuotes(
  fromToken,
  toToken,
  amount
);

// Returns: Quote[] với thông tin từ smart contracts
```

### 3. Thực Hiện Swap

```typescript
const result = await hederaContractService.executeSwap(
  quote,
  fromToken,
  toToken,
  amount,
  slippage
);

// Returns: SwapResult với success/error status
```

### 4. Kiểm Tra Deployment

```typescript
const isDeployed = await hederaContractService.checkContractDeployment();
const addresses = hederaContractService.getContractAddresses();
```

## Smart Contract Functions

### Exchange Contract (`0.0.9533134`)

```solidity
// Main swap function
function swap(
    string aggregatorId,
    bytes path,
    uint256 amountFrom,
    uint256 amountTo,
    uint256 deadline,
    bool isTokenFromHBAR,
    bool feeOnTransfer
) external payable

// Get adapter address
function adapters(string) external view returns (address)

// Get adapter fee
function adapterFee(string) external view returns (uint8)
```

### Adapter Contracts

Mỗi adapter có các function tương tự:

```solidity
// Get fee percentage
function feePromille() external view returns (uint8)

// Execute swap on specific DEX
function swap(
    address payable recipient,
    bytes path,
    uint256 amountFrom,
    uint256 amountTo,
    uint256 deadline,
    bool feeOnTransfer
) external payable
```

## Tích Hợp Với Frontend

### 1. Trang Hedera Aggregator

Trang chính đã được tích hợp với smart contracts:

- **Quote Fetching**: Lấy quotes từ smart contracts
- **Swap Execution**: Thực hiện swap qua Exchange contract
- **Contract Status**: Hiển thị trạng thái deployment
- **Error Handling**: Xử lý lỗi từ smart contracts

### 2. Wallet Integration

Tích hợp với ví Hedera:

- **HashPack**: Ví chính cho Hedera
- **EVM Wallets**: MetaMask, WalletConnect
- **Transaction Signing**: Ký giao dịch swap

### 3. Real-time Updates

- **Quote Refresh**: Cập nhật quotes theo thời gian thực
- **Transaction Status**: Theo dõi trạng thái giao dịch
- **Balance Updates**: Cập nhật balance sau swap

## Testing

### 1. Test Contract Integration

```typescript
import { testContractIntegration } from './test-contract-integration';

// Chạy test trong browser console
testContractIntegration();
```

### 2. Test Functions

- ✅ Check contract addresses
- ✅ Verify contract deployment
- ✅ Get quotes from contracts
- ✅ Simulate swap execution
- ✅ Error handling

## Environment Variables

Cấu hình trong `.env.local`:

```env
VITE_NETWORK=mainnet
VITE_EXCHANGE_CONTRACT_ADDRESS=0.0.9533134
VITE_SAUCERSWAP_ADAPTER_ADDRESS=0.0.9533174
VITE_HELISWAP_ADAPTER_ADDRESS=0.0.9533179
VITE_PANGOLIN_ADAPTER_ADDRESS=0.0.9533188
```

## Troubleshooting

### Lỗi Thường Gặp

1. **Contract Not Found**
   - Kiểm tra địa chỉ contract có đúng không
   - Xác nhận contract đã được deploy trên mainnet

2. **Transaction Failed**
   - Kiểm tra balance đủ
   - Tăng gas limit
   - Kiểm tra slippage tolerance

3. **Quote Fetching Failed**
   - Kiểm tra network connection
   - Xác nhận adapter contracts hoạt động
   - Kiểm tra token addresses

### Debug Commands

```bash
# Kiểm tra contract deployment
curl -X GET "https://mainnet-public.mirrornode.hedera.com/api/v1/contracts/0.0.9533134"

# Kiểm tra transaction
curl -X GET "https://mainnet-public.mirrornode.hedera.com/api/v1/transactions/{txHash}"
```

## Roadmap

### Phase 1 (Hoàn thành)
- ✅ Smart contract deployment
- ✅ Basic integration
- ✅ Quote fetching
- ✅ Swap execution simulation

### Phase 2 (Đang phát triển)
- 🔄 Real transaction execution
- 🔄 Gas estimation
- 🔄 Transaction monitoring
- 🔄 Error recovery

### Phase 3 (Kế hoạch)
- 📋 Advanced features
- 📋 Multi-hop routing
- 📋 MEV protection
- 📋 Analytics integration

## Liên Hệ

- **Smart Contract Issues**: Kiểm tra deployment report
- **Frontend Issues**: Kiểm tra console logs
- **Integration Issues**: Chạy test functions

---

**Lưu ý**: Smart contracts đã được deploy trên Hedera mainnet và sẵn sàng để tích hợp với frontend. 
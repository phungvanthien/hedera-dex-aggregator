# Wallet Integration Guide

## Tổng Quan

Hướng dẫn tích hợp và đồng bộ hóa wallet connection trên trang Hedera DEX Aggregator.

## Vấn Đề Đã Giải Quyết

### ❌ Vấn Đề Trước Đây
- **2 nút Connect Wallet riêng biệt**: Một trong navbar, một trong main content
- **Không đồng bộ**: Trạng thái wallet không được cập nhật đồng bộ giữa 2 nút
- **UX kém**: Người dùng bối rối với nhiều nút connect wallet

### ✅ Giải Pháp Hiện Tại
- **1 nút Connect Wallet duy nhất**: Chỉ trong navbar
- **Đồng bộ hoàn toàn**: Trạng thái wallet được cập nhật real-time
- **UX tốt**: Giao diện rõ ràng và nhất quán

## Cấu Trúc Wallet Integration

### 1. WalletContext (`src/context/WalletContext.tsx`)

Context chính quản lý trạng thái wallet:

```typescript
interface WalletContextType {
  accountId: string | null;
  balance: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}
```

### 2. WalletSelector (`src/components/wallet/wallet-selector.tsx`)

Component chính để kết nối wallet:

```typescript
export function WalletSelector() {
  // Dialog để chọn loại wallet (HashPack/EVM)
  // Xử lý kết nối wallet
  // Hiển thị trạng thái connection
}
```

### 3. WalletStatusIndicator (`src/components/wallet/wallet-status-indicator.tsx`)

Component hiển thị trạng thái wallet:

```typescript
// WalletStatusIndicator: Hiển thị trạng thái ngắn gọn
// WalletStatusCard: Hiển thị thông tin chi tiết
```

## Cách Hoạt Động

### 1. Navbar Integration

```typescript
// Trong navbar - chỉ có 1 nút connect wallet
<div className="flex items-center space-x-2">
  <WalletStatusIndicator showDetails={false} />
  <WalletSelector />
</div>
```

**Tính năng:**
- Hiển thị trạng thái connection (Connected/Not Connected)
- Nút connect wallet duy nhất
- Icon và màu sắc phù hợp với trạng thái

### 2. Sidebar Status

```typescript
// Trong sidebar - hiển thị thông tin chi tiết
<div className="mb-4">
  <WalletStatusCard />
</div>
```

**Tính năng:**
- Hiển thị account ID khi đã kết nối
- Hiển thị balance HBAR
- Thông báo trạng thái "Ready to trade"
- Hướng dẫn connect wallet khi chưa kết nối

### 3. Real-time Synchronization

```typescript
// WalletContext tự động cập nhật trạng thái
const { accountId, balance, isConnected } = useContext(WalletContext);

// Tất cả components tự động re-render khi trạng thái thay đổi
```

## Wallet Types

### 1. HashPack (Hedera Native)

**Ưu điểm:**
- Tích hợp tốt với Hedera
- Hỗ trợ đầy đủ các tính năng Hedera
- UX mượt mà

**Cách sử dụng:**
1. Click "Connect Wallet" trong navbar
2. Chọn "HashPack"
3. Approve connection trong HashPack extension

### 2. EVM Wallets (MetaMask, WalletConnect)

**Ưu điểm:**
- Tương thích với nhiều ví
- Quen thuộc với người dùng

**Cách sử dụng:**
1. Click "Connect Wallet" trong navbar
2. Chọn "MetaMask / EVM"
3. Approve connection trong MetaMask

## Trạng Thái Wallet

### 1. Not Connected

**Navbar:**
- Icon: ❌ (XCircle)
- Text: "Not Connected"
- Color: Red

**Sidebar:**
- Card: Red border
- Message: "Wallet not connected"
- Instruction: "Connect your Hedera wallet using the button in the navigation bar"

### 2. Connected

**Navbar:**
- Icon: ✅ (CheckCircle)
- Text: "Connected"
- Color: Green

**Sidebar:**
- Card: Green border
- Account ID: Hiển thị đầy đủ
- Balance: "X.XX HBAR"
- Status: "Ready to trade"

## Error Handling

### 1. Connection Failed

```typescript
// Hiển thị error message
<div className="text-sm text-red-400">
  Failed to connect wallet. Please try again.
</div>
```

### 2. Network Mismatch

```typescript
// Kiểm tra network
if (network !== 'mainnet') {
  // Hiển thị warning
  <div className="text-sm text-yellow-400">
    Please switch to Hedera mainnet
  </div>
}
```

### 3. Balance Loading

```typescript
// Hiển thị loading state
<span className="text-sm text-gray-400">
  {balance ? `${balance} HBAR` : 'Loading...'}
</span>
```

## Testing

### 1. Test Connection Flow

```typescript
// Test trong browser console
const walletContext = document.querySelector('[data-wallet-context]');
console.log('Wallet Context:', walletContext);
```

### 2. Test Status Updates

1. Connect wallet
2. Kiểm tra navbar status thay đổi
3. Kiểm tra sidebar status thay đổi
4. Disconnect wallet
5. Kiểm tra cả 2 status reset

### 3. Test Error Scenarios

1. Reject connection
2. Switch network
3. Disconnect unexpectedly
4. Check error messages

## Best Practices

### 1. Single Source of Truth

- **WalletContext** là nguồn duy nhất cho wallet state
- Tất cả components đọc từ context
- Không có local state riêng biệt

### 2. Consistent UI

- Sử dụng cùng icons và colors
- Text messages nhất quán
- Layout responsive

### 3. User Experience

- Clear instructions
- Loading states
- Error messages helpful
- Smooth transitions

## Troubleshooting

### Lỗi Thường Gặp

1. **Wallet không kết nối**
   - Kiểm tra extension đã cài chưa
   - Kiểm tra network đúng không
   - Clear browser cache

2. **Status không đồng bộ**
   - Refresh page
   - Check WalletContext
   - Verify component imports

3. **Balance không hiển thị**
   - Kiểm tra account có HBAR không
   - Check network connection
   - Verify API calls

### Debug Commands

```bash
# Kiểm tra wallet connection
console.log('Wallet Context:', useContext(WalletContext));

# Test connection
window.testWalletConnection();

# Check balance
window.checkWalletBalance();
```

## Roadmap

### Phase 1 (Hoàn thành)
- ✅ Single wallet selector
- ✅ Synchronized status
- ✅ Error handling
- ✅ Responsive design

### Phase 2 (Kế hoạch)
- 🔄 Multiple wallet support
- 🔄 Auto-reconnection
- 🔄 Transaction history
- 🔄 Advanced settings

---

**Kết quả**: Wallet integration đã được đồng bộ hóa hoàn toàn với UX tốt hơn! 
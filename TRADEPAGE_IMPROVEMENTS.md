# TradePage Improvements - Logic Hiển thị Nút Connect Wallet/Swap

## Các cải tiến đã thực hiện:

### 1. **Thêm Wallet Context Integration**
- Import `useContext` và `WalletContext`
- Lấy `accountId` và `balance` từ context
- Tạo biến `isWalletConnected` để kiểm tra trạng thái

### 2. **Cải thiện Logic Nút Swap/Connect Wallet**
```tsx
// Trước:
<Button className="w-full" size="lg">
  <Wallet className="mr-2 h-4 w-4" />
  Connect Wallet
</Button>

// Sau:
{isWalletConnected ? (
  <Button className="w-full" size="lg" disabled={!fromAmount || !toAmount}>
    <Zap className="mr-2 h-4 w-4" />
    {!fromAmount || !toAmount ? "Enter Amount" : "Swap"}
  </Button>
) : (
  <div className="space-y-4">
    <div className="text-center text-sm text-muted-foreground">
      Connect your wallet to start trading
    </div>
    <WalletSelector />
  </div>
)}
```

### 3. **Cải thiện Hiển thị Balance**
- Hiển thị balance thực từ wallet thay vì mock data
- Nút MAX chỉ hiển thị khi đã kết nối ví
- Balance hiển thị "Connect Wallet" khi chưa kết nối

### 4. **Cải thiện Input Fields**
- Disable input fields khi chưa kết nối ví
- TokenSelector sử dụng balance thực từ wallet

### 5. **Cải thiện Portfolio Tab**
- Hiển thị thông tin portfolio khi đã kết nối ví
- Hiển thị account ID và balance
- Grid layout cho thông tin balance và USD value

## Trải nghiệm người dùng mới:

### **Khi chưa kết nối ví:**
- Input fields bị disable
- Balance hiển thị "Connect Wallet"
- Nút "Connect Wallet" với WalletSelector
- Portfolio tab hiển thị thông báo kết nối

### **Khi đã kết nối ví:**
- Input fields được enable
- Balance hiển thị số dư thực
- Nút "Swap" (disabled nếu chưa nhập amount)
- Portfolio tab hiển thị thông tin chi tiết

### **Logic nút Swap:**
- **Disabled**: Khi chưa nhập amount
- **"Enter Amount"**: Khi đã kết nối nhưng chưa nhập
- **"Swap"**: Khi đã nhập đủ amount

## Lợi ích:

✅ **UX tốt hơn**: Người dùng biết rõ trạng thái và hành động cần thực hiện
✅ **Logic rõ ràng**: Không có nút không hoạt động
✅ **Thông tin thực**: Hiển thị balance và thông tin thực từ wallet
✅ **Responsive**: Giao diện thích ứng với trạng thái kết nối
✅ **Intuitive**: Hướng dẫn người dùng từng bước

## Để test:

1. Truy cập **http://localhost:3000/trade**
2. Kiểm tra trạng thái khi chưa kết nối ví
3. Kết nối ví và kiểm tra trạng thái mới
4. Test các tính năng: MAX button, input fields, portfolio tab 
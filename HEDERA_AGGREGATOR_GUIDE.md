# Hedera DEX Aggregator - Hướng Dẫn Sử Dụng

## Tổng Quan

Hedera DEX Aggregator là một trang web mới được tạo ra dựa trên thiết kế của dự án Dexonic Aggregator, được điều chỉnh để hoạt động với blockchain Hedera. Trang này cung cấp giao diện swap token với khả năng so sánh giá từ nhiều DEX khác nhau.

## Tính Năng Chính

### 🔄 Swap Interface
- **Token Selection**: Chọn token từ danh sách có sẵn (HBAR, USDC, USDT, ETH, WBTC, SAUCE, HELI, PNG)
- **Amount Input**: Nhập số lượng token muốn swap
- **Real-time Calculation**: Tự động tính toán số lượng token nhận được
- **Price Display**: Hiển thị giá trị USD tương ứng

### 🏦 DEX Aggregation
- **Multi-DEX Support**: Hỗ trợ 3 DEX chính trên Hedera:
  - **SaucerSwap**: Fee 0.25%
  - **HeliSwap**: Fee 0.30%
  - **Pangolin**: Fee 0.20%
- **Best Quote Selection**: Tự động chọn DEX có giá tốt nhất
- **Quote Comparison**: Hiển thị bảng so sánh giá từ tất cả DEX

### ⚙️ Swap Settings
- **Slippage Tolerance**: Cài đặt độ trượt giá (0.1%, 0.5%, 1%)
- **Transaction Deadline**: Thời gian hết hạn giao dịch
- **Wallet Integration**: Tích hợp với ví Hedera (HashPack)

### 📊 Market Overview
- **Real-time Prices**: Giá token theo thời gian thực
- **24h Changes**: Biến động giá trong 24 giờ
- **Market Pairs**: Các cặp token phổ biến

## Cách Sử Dụng

### 1. Kết Nối Ví
1. Click vào "Connect Wallet" trên navbar
2. Chọn HashPack hoặc EVM wallet
3. Chấp nhận kết nối từ ví

### 2. Chọn Token
1. Click vào dropdown của "You pay" để chọn token gửi
2. Click vào dropdown của "You receive" để chọn token nhận
3. Nhập số lượng token muốn swap

### 3. So Sánh Giá
1. Hệ thống sẽ tự động hiển thị bảng so sánh giá từ các DEX
2. DEX có nhãn "Best" sẽ được chọn tự động
3. Xem thông tin về fee, price impact của từng DEX

### 4. Thực Hiện Swap
1. Click "Swap" để thực hiện giao dịch
2. Xác nhận giao dịch trên ví
3. Chờ giao dịch hoàn tất

## Cấu Trúc File

```
src/
├── pages/
│   └── HederaAggregator.tsx          # Trang chính
├── styles/
│   └── hedera-aggregator.css         # CSS tùy chỉnh
└── components/
    └── wallet/
        └── wallet-selector.tsx       # Component chọn ví
```

## Tính Năng Kỹ Thuật

### State Management
- **Token State**: Quản lý token được chọn
- **Amount State**: Quản lý số lượng nhập
- **Quote State**: Quản lý báo giá từ DEX
- **Wallet State**: Quản lý trạng thái ví

### Mock Data
- **Token List**: Danh sách token với giá mock
- **Market Data**: Dữ liệu thị trường mock
- **Quote Calculation**: Tính toán báo giá mock

### Responsive Design
- **Desktop**: Layout 3 cột (Settings, Swap, Market)
- **Mobile**: Layout 1 cột với navigation menu
- **Tablet**: Layout 2 cột

## Tích Hợp Smart Contract

### Hiện Tại
- Sử dụng mock data cho demo
- Tính toán giá dựa trên tỷ lệ cố định
- Simulate swap execution

### Tương Lai
- Tích hợp với smart contract đã deploy
- Kết nối với DEX API thực tế
- Implement real swap execution

## Cấu Hình

### Environment Variables
```env
VITE_NETWORK=mainnet
VITE_EXCHANGE_CONTRACT_ADDRESS=0.0.xxxxx
VITE_SAUCERSWAP_ADAPTER_ADDRESS=0.0.xxxxx
VITE_HELISWAP_ADAPTER_ADDRESS=0.0.xxxxx
VITE_PANGOLIN_ADAPTER_ADDRESS=0.0.xxxxx
```

### Network Configuration
- **Hedera Mainnet**: Chain ID 295
- **RPC Endpoint**: mainnet-public.mirrornode.hedera.com
- **Block Explorer**: hashscan.io

## Troubleshooting

### Lỗi Thường Gặp

1. **Wallet Not Connected**
   - Kiểm tra extension HashPack đã cài đặt
   - Refresh trang và thử kết nối lại

2. **No Quotes Available**
   - Kiểm tra cặp token có được hỗ trợ
   - Thử với số lượng khác

3. **Swap Failed**
   - Kiểm tra balance đủ
   - Tăng slippage tolerance
   - Kiểm tra network connection

### Debug
- Mở Developer Tools (F12)
- Xem Console tab để kiểm tra lỗi
- Kiểm tra Network tab để xem API calls

## Roadmap

### Phase 1 (Hoàn thành)
- ✅ UI/UX Design
- ✅ Mock Data Integration
- ✅ Wallet Connection
- ✅ Basic Swap Interface

### Phase 2 (Đang phát triển)
- 🔄 Smart Contract Integration
- 🔄 Real DEX API Connection
- 🔄 Transaction Execution

### Phase 3 (Kế hoạch)
- 📋 Advanced Features
- 📋 Analytics Dashboard
- 📋 Mobile App

## Đóng Góp

Để đóng góp vào dự án:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Tạo Pull Request

## Liên Hệ

- **GitHub**: [Repository Link]
- **Email**: [Your Email]
- **Discord**: [Community Link]

---

**Lưu ý**: Đây là phiên bản demo với mock data. Không sử dụng cho giao dịch thực tế cho đến khi tích hợp hoàn chỉnh với smart contract. 
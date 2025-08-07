# Hedera Network Configuration Changes

## Chuyển từ Testnet sang Mainnet

### Các thay đổi đã thực hiện:

#### 1. **src/config/wagmi.ts**
- Thay đổi `hederaTestnet` thành `hederaMainnet`
- Chain ID: 296 → 295
- RPC URL: `https://testnet.hashio.io/api` → `https://mainnet.hashio.io/api`
- Block Explorer: `https://hashscan.io/testnet` → `https://hashscan.io`
- Testnet flag: `true` → `false`

#### 2. **src/context/WalletContext.tsx**
- Mirror Node URL: `testnet.mirrornode.hedera.com` → `mainnet-public.mirrornode.hedera.com`
- HashPack API network: `"testnet"` → `"mainnet"`

#### 3. **src/hooks/accountBalance.ts**
- Client initialization: `Client.forTestnet()` → `Client.forMainnet()`

#### 4. **src/hooks/walletConnect.ts**
- Environment: `"testnet"` → `"mainnet"`

#### 5. **src/hooks/useEvmWallet.ts**
- Function name: `addOrSwitchHederaTestnet` → `addOrSwitchHederaMainnet`
- Chain ID hex: `"0x128"` (296) → `"0x127"` (295)
- Import: `hederaTestnet` → `hederaMainnet`

### Thông tin Mainnet:
- **Chain ID**: 295
- **Chain ID Hex**: 0x127
- **RPC URL**: https://mainnet.hashio.io/api
- **Block Explorer**: https://hashscan.io
- **Network**: mainnet

### Lưu ý quan trọng:
1. **Wallet Connection**: Bây giờ sẽ kết nối với Hedera Mainnet
2. **Real Transactions**: Các giao dịch sẽ sử dụng HBAR thật
3. **Gas Fees**: Sẽ có phí giao dịch thật
4. **Testing**: Nên test kỹ trước khi sử dụng với tiền thật

### Để test:
1. Truy cập http://localhost:3000
2. Kết nối wallet (HashPack hoặc EVM wallet)
3. Kiểm tra network được chọn là Hedera Mainnet 
# 🚀 Hedera DEX Aggregator Deployment Guide

## 📋 Tổng quan

Hướng dẫn deploy smart contracts của Hedera DEX Aggregator lên Hedera mainnet.

## 🛠️ Prerequisites

### 1. **Hedera Account Setup**
- ✅ Tạo Hedera account trên mainnet
- ✅ Có ít nhất 10 HBAR cho deployment
- ✅ Private key và Account ID

### 2. **Development Environment**
- ✅ Node.js v18 (recommended for Hardhat)
- ✅ npm hoặc yarn
- ✅ Git

### 3. **Testnet Testing**
- ✅ Deploy và test trên testnet trước
- ✅ Verify contracts hoạt động đúng

## 🔧 Setup Environment

### 1. **install**

npm install
```

### 2. **Configure Environment Variables**
Tạo file `.env` với thông tin sau:

```env
# Hedera Mainnet Configuration
MAINNET_OPERATOR_PRIVATE_KEY_HEX=your_private_key_here
MAINNET_OPERATOR_PRIVATE_KEY_DER=your_private_key_der_here
MAINNET_OPERATOR_ACCOUNT_ID=your_account_id_here
MAINNET_ENDPOINT=https://mainnet.hashio.io/api

# Testnet Configuration (for testing)
TESTNET_OPERATOR_PRIVATE_KEY_HEX=your_testnet_private_key_here
TESTNET_OPERATOR_PRIVATE_KEY_DER=your_testnet_private_key_der_here
TESTNET_OPERATOR_ACCOUNT_ID=your_testnet_account_id_here
TESTNET_ENDPOINT=https://testnet.hashio.io/api
```

### 3. **Get Testnet HBAR**
```bash
# Truy cập: https://portal.hedera.com/
# Tạo testnet account và nhận HBAR miễn phí
```

## 🧪 Testnet Deployment

### 1. **Test Deployment**
```bash
# Deploy test contract
node scripts/deployTestnet.js
```

### 2. **Verify Testnet Deployment**
- Kiểm tra contract trên HashScan testnet
- Test các functions cơ bản
- Verify gas usage và performance

### 3. **Test Integration**
```bash
# Test với frontend
cd ../Hedera-DEX
npm run dev
# Truy cập http://localhost:3000/aggregator
```

## 🚀 Mainnet Deployment

### ⚠️ **IMPORTANT: Mainnet Deployment Checklist**

- [ ] ✅ Testnet deployment thành công
- [ ] ✅ Contracts đã được audit
- [ ] ✅ Có đủ HBAR (ít nhất 10 HBAR)
- [ ] ✅ Private keys được backup an toàn
- [ ] ✅ Environment variables đã config đúng
- [ ] ✅ Team đã review và approve

### 1. **Final Verification**
```bash
# Kiểm tra balance
node scripts/checkBalance.js

# Kiểm tra environment
node scripts/verifyEnv.js
```

### 2. **Deploy to Mainnet**
```bash
# Deploy contracts lên mainnet
node scripts/deployMainnet.js
```

### 3. **Verify Mainnet Deployment**
```bash
# Verify contracts trên HashScan mainnet
# Test các functions với real HBAR
# Monitor gas usage và performance
```

## 📊 Contract Addresses

Sau khi deploy thành công, bạn sẽ có các contract addresses sau:

```json
{
  "network": "mainnet",
  "contracts": {
    "exchange": "0.0.xxxxx",
    "adapters": {
      "saucerswap": "0.0.xxxxx",
      "saucerswapv2": "0.0.xxxxx", 
      "heliswap": "0.0.xxxxx",
      "pangolin": "0.0.xxxxx"
    }
  }
}
```

## 🔗 HashScan Links

### Mainnet
- **Exchange**: `https://hashscan.io/mainnet/contract/0.0.xxxxx`
- **SaucerSwap Adapter**: `https://hashscan.io/mainnet/contract/0.0.xxxxx`
- **HeliSwap Adapter**: `https://hashscan.io/mainnet/contract/0.0.xxxxx`
- **Pangolin Adapter**: `https://hashscan.io/mainnet/contract/0.0.xxxxx`

### Testnet
- **Exchange**: `https://hashscan.io/testnet/contract/0.0.xxxxx`
- **Test Contract**: `https://hashscan.io/testnet/contract/0.0.xxxxx`

## 🔧 Frontend Integration

### 1. **Update Contract Addresses**
```typescript
// src/config/contracts.ts
export const CONTRACT_CONFIG = {
  contracts: {
    exchange: {
      mainnet: "0.0.xxxxx", // Mainnet address
      testnet: "0.0.xxxxx"  // Testnet address
    }
  }
};
```

### 2. **Update Environment Variables**
```env
# .env.local
VITE_EXCHANGE_CONTRACT_ADDRESS=0.0.xxxxx
```

### 3. **Test Integration**
```bash
# Restart frontend
npm run dev
# Test swap functionality
```

## 🛡️ Security Considerations

### 1. **Private Key Security**
- ✅ Không commit private keys vào Git
- ✅ Sử dụng environment variables
- ✅ Backup private keys an toàn
- ✅ Sử dụng hardware wallet nếu có thể

### 2. **Contract Security**
- ✅ Audit contracts trước khi deploy
- ✅ Test thoroughly trên testnet
- ✅ Monitor contracts sau deployment
- ✅ Have upgrade mechanism ready

### 3. **Access Control**
- ✅ Set proper permissions
- ✅ Use multi-sig nếu cần
- ✅ Monitor admin functions

## 📈 Post-Deployment

### 1. **Monitoring**
- Monitor contract interactions
- Track gas usage
- Monitor for errors
- Set up alerts

### 2. **Analytics**
- Track swap volumes
- Monitor user activity
- Analyze performance
- Optimize gas usage

### 3. **Maintenance**
- Regular security updates
- Performance optimization
- Bug fixes
- Feature updates

## 🆘 Troubleshooting

### Common Issues

#### 1. **Insufficient Balance**
```bash
# Error: Insufficient balance for deployment
# Solution: Add more HBAR to account
```

#### 2. **Invalid Private Key**
```bash
# Error: Invalid account: private key too short
# Solution: Check private key format and length
```

#### 3. **Contract Compilation Failed**
```bash
# Error: Compilation errors
# Solution: Check Solidity version and dependencies
```

#### 4. **Network Issues**
```bash
# Error: Network timeout
# Solution: Check internet connection and Hedera network status
```

### Support Resources
- **Hedera Documentation**: https://docs.hedera.com/
- **HashScan**: https://hashscan.io/
- **Hedera Portal**: https://portal.hedera.com/
- **EtaSwap Documentation**: https://docs.etaswap.com/

## 🎉 Success Checklist

- [ ] ✅ Contracts deployed successfully
- [ ] ✅ All adapters configured
- [ ] ✅ Fees set correctly
- [ ] ✅ Frontend integrated
- [ ] ✅ Test transactions successful
- [ ] ✅ Monitoring setup
- [ ] ✅ Documentation updated
- [ ] ✅ Team notified

---

**🚀 Congratulations! Your Hedera DEX Aggregator is now live on mainnet!**

**Built with ❤️ for the Hedera ecosystem** 
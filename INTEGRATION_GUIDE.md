# Hedera DEX Aggregator - Integration Guide

## 🎯 Overview

This guide explains how to integrate EtaSwap smart contracts with the Hedera DEX frontend to create a complete DEX aggregator.

## 📋 Current Status

### ✅ Completed
- [x] Cloned EtaSwap smart contracts
- [x] Created contract service layer
- [x] Created swap service layer
- [x] Created React hooks for swap functionality
- [x] Updated TradePage with real swap functionality
- [x] Updated RouteComparison with live data
- [x] Installed ethers.js for contract interactions

### 🔄 In Progress
- [ ] Deploy contracts to testnet
- [ ] Test end-to-end functionality
- [ ] Integrate real price feeds

### 📋 Next Steps
- [ ] Deploy to mainnet
- [ ] Add transaction history
- [ ] Implement advanced features

## 🏗️ Architecture

```
Frontend (React) ←→ Contract Service Layer ←→ EtaSwap Contracts ←→ Hedera DEXs
     ↓                    ↓                        ↓
Wallet Context      Price Oracle Service      Exchange Contract
Token Selector     Route Optimization        Adapter Contracts
Trading Chart      Transaction Handler       Oracle Contracts
```

## 📁 File Structure

```
Hedera-DEX/
├── src/
│   ├── services/
│   │   ├── contractService.ts      # Contract interactions
│   │   └── swapService.ts          # Swap operations
│   ├── hooks/
│   │   └── useSwap.ts              # Swap hooks
│   ├── config/
│   │   └── contracts.ts            # Contract configuration
│   └── pages/
│       └── TradePage.tsx           # Updated with swap functionality
```

## 🚀 Deployment Instructions

### 1. Deploy Smart Contracts

```bash
cd etaswap-smart-contracts-v2

# Set up environment variables
cp .env.example .env
# Edit .env with your private keys

# Deploy to testnet
npx hardhat run scripts/deployHedera.js --network testnet

# Deploy to mainnet (after testing)
npx hardhat run scripts/deployHedera.js --network mainnet
```

### 2. Update Contract Addresses

After deployment, update `src/config/contracts.ts` with the deployed addresses:

```typescript
contracts: {
  exchange: {
    mainnet: '0x...', // Deployed exchange address
    testnet: '0x...'  // Deployed exchange address
  },
  adapters: {
    saucerswap: {
      mainnet: '0x...', // Deployed adapter address
      testnet: '0x...'
    },
    // ... other adapters
  }
}
```

### 3. Test Integration

```bash
# Start frontend
npm run dev

# Test swap functionality
# 1. Connect wallet
# 2. Enter swap amount
# 3. Check route comparison
# 4. Execute swap
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the frontend project:

```env
VITE_EXCHANGE_CONTRACT_ADDRESS=0x... # Deployed exchange address
VITE_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
VITE_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
```

### Network Configuration

The system supports both Hedera mainnet and testnet:

- **Mainnet**: Chain ID 295, RPC: https://mainnet.hashio.io/api
- **Testnet**: Chain ID 296, RPC: https://testnet.hashio.io/api

## 📊 Features

### ✅ Implemented
- **Multi-DEX Support**: SaucerSwap, HeliSwap, Pangolin
- **Route Comparison**: Real-time route optimization
- **Wallet Integration**: HashPack + EVM wallets
- **Price Feeds**: Mock implementation (ready for real oracles)
- **Transaction Handling**: Full swap execution flow

### 🔄 Planned
- **Real Price Oracles**: Integration with actual price feeds
- **Transaction History**: Track past swaps
- **Advanced Routing**: Multi-hop routes
- **Slippage Protection**: Advanced slippage controls

## 🧪 Testing

### Manual Testing
1. **Wallet Connection**: Test HashPack and MetaMask
2. **Token Selection**: Verify token picker works
3. **Quote Generation**: Check route comparison updates
4. **Swap Execution**: Test actual swap transactions

### Automated Testing
```bash
# Run contract tests
cd etaswap-smart-contracts-v2
npm test

# Run frontend tests (when implemented)
npm test
```

## 🔍 Troubleshooting

### Common Issues

1. **Contract Not Found**
   - Verify contract addresses in config
   - Check network connection
   - Ensure contracts are deployed

2. **Transaction Fails**
   - Check wallet balance
   - Verify gas settings
   - Check slippage tolerance

3. **Price Feeds Not Working**
   - Oracle contracts not deployed
   - Network connectivity issues
   - Mock data fallback active

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# Check contract state
npx hardhat console --network mainnet
> const exchange = await ethers.getContractAt("Exchange", "ADDRESS")
> await exchange.adapters("saucerswap")
```

## 📈 Performance Optimization

### Frontend
- Debounced quote requests (500ms)
- Lazy loading of components
- Optimized re-renders

### Smart Contracts
- Gas optimization in adapters
- Efficient path encoding
- Batch operations where possible

## 🔐 Security Considerations

### Smart Contracts
- Access control on admin functions
- Reentrancy protection
- Slippage checks
- Deadline validation

### Frontend
- Input validation
- Error handling
- Transaction confirmation
- Wallet security

## 📚 Resources

- [EtaSwap Documentation](https://github.com/EtaSwap/etaswap-smart-contracts-v2)
- [Hedera Documentation](https://docs.hedera.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the documentation
- Open an issue on GitHub 
// Test file for Hedera Contract Integration
import { hederaContractService } from './services/hederaContractService';

// Test token data
const testFromToken = {
  symbol: "HBAR",
  name: "Hedera",
  address: "0.0.3",
  decimals: 8,
  logoUrl: "/hedera-logo.svg",
  price: 0.05,
};

const testToToken = {
  symbol: "USDC",
  name: "USD Coin",
  address: "0.0.123456",
  decimals: 6,
  logoUrl: "/usdc-logo.svg",
  price: 1.0,
};

// Test functions
export async function testContractIntegration() {
  console.log("🧪 Testing Hedera Contract Integration...");

  try {
    // Test 1: Check contract addresses
    console.log("📋 Contract Addresses:");
    const addresses = hederaContractService.getContractAddresses();
    console.log("Exchange:", addresses.exchange);
    console.log("SaucerSwap:", addresses.saucerswap);
    console.log("HeliSwap:", addresses.heliswap);
    console.log("Pangolin:", addresses.pangolin);

    // Test 2: Check contract deployment
    console.log("🔍 Checking contract deployment...");
    const isDeployed = await hederaContractService.checkContractDeployment();
    console.log("Contracts deployed:", isDeployed);

    // Test 3: Get quotes
    console.log("💰 Getting quotes...");
    const quotes = await hederaContractService.getQuotes(testFromToken, testToToken, "100");
    console.log("Quotes received:", quotes.length);
    quotes.forEach((quote, index) => {
      console.log(`Quote ${index + 1}:`, {
        dex: quote.dex,
        outputAmount: quote.outputAmount,
        fee: quote.fee,
        pool_address: quote.pool_address,
      });
    });

    // Test 4: Test swap execution (simulation)
    if (quotes.length > 0) {
      console.log("🔄 Testing swap execution...");
      const result = await hederaContractService.executeSwap(
        quotes[0],
        testFromToken,
        testToToken,
        "100",
        0.5
      );
      console.log("Swap result:", result);
    }

    console.log("✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testContractIntegration = testContractIntegration;
} else {
  // Node.js environment
  testContractIntegration();
} 
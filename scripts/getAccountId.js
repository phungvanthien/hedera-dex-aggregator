const {
  Client,
  PrivateKey,
  AccountId,
} = require("@hashgraph/sdk");

async function getAccountId() {
  console.log("🔍 Getting Account ID from private key...");

  const privateKeyHex = "d8fc50eb2ca055b1703bc9bc225889ffa29565b3e5ad63b6a384f2adba2daebb";

  try {
    // Create Hedera client for mainnet
    const client = Client.forMainnet();
    
    // Create private key
    const privateKey = PrivateKey.fromString(privateKeyHex);
    
    // Get public key
    const publicKey = privateKey.publicKey;
    
    console.log("🔑 Public Key:", publicKey.toString());
    
    // Note: We can't directly get Account ID from private key
    // We need to either:
    // 1. Use a known account ID
    // 2. Create a new account
    // 3. User provides the account ID
    
    console.log("\n📝 To deploy contracts, you need to provide:");
    console.log("1. Account ID (e.g., 0.0.123456)");
    console.log("2. Confirm you have at least 10 HBAR in the account");
    
    console.log("\n💡 You can find your Account ID:");
    console.log("- In your Hedera wallet (HashPack, Blade, etc.)");
    console.log("- On HashScan: https://hashscan.io/");
    console.log("- In your account creation confirmation");
    
    console.log("\n🔗 Check your account on HashScan:");
    console.log("https://hashscan.io/mainnet");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

getAccountId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 
const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractFunctionParameters,
  AccountBalanceQuery,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting Hedera DEX Aggregator deployment to TESTNET...");

  // Check environment variables
  if (!process.env.TESTNET_OPERATOR_PRIVATE_KEY_HEX || 
      !process.env.TESTNET_OPERATOR_ACCOUNT_ID) {
    console.error("❌ Missing required environment variables!");
    console.error("Please set TESTNET_OPERATOR_PRIVATE_KEY_HEX and TESTNET_OPERATOR_ACCOUNT_ID");
    console.log("\n💡 Example .env file:");
    console.log("TESTNET_OPERATOR_PRIVATE_KEY_HEX=0x1234567890abcdef...");
    console.log("TESTNET_OPERATOR_ACCOUNT_ID=0.0.123456");
    process.exit(1);
  }

  try {
    // Create Hedera client for testnet
    const client = Client.forTestnet();
    
    // Setup account credentials
    const operatorPrivateKey = PrivateKey.fromString(process.env.TESTNET_OPERATOR_PRIVATE_KEY_HEX);
    const operatorAccountId = AccountId.fromString(process.env.TESTNET_OPERATOR_ACCOUNT_ID);
    
    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log("📝 Deploying with account:", operatorAccountId.toString());
    
    // Get account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorAccountId)
      .execute(client);
    console.log("💰 Account balance:", balance.hbars.toString());

    // Check if we have enough HBAR for deployment
    if (balance.hbars.toTinybars() < 1000000000) { // 1 HBAR
      console.error("❌ Insufficient balance for deployment. Need at least 1 HBAR");
      console.log("💡 Get testnet HBAR from: https://portal.hedera.com/");
      process.exit(1);
    }

    console.log("\n📦 Creating test contract...");
    
    // Create a simple test contract (placeholder)
    const testContract = new ContractCreateFlow()
      .setGas(1000000)
      .setBytecode("0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220d6c4c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c64736f6c63430008120033")
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxChunkSize(1000);

    const testResponse = await testContract.execute(client);
    const testReceipt = await testResponse.getReceipt(client);
    const testContractId = testReceipt.contractId;
    
    console.log("✅ Test contract deployed to:", testContractId.toString());

    // Deployment summary
    console.log("\n🎉 Test deployment completed successfully!");
    console.log("=".repeat(50));
    console.log("📋 Contract Addresses:");
    console.log("Test Contract:", testContractId.toString());
    console.log("=".repeat(50));

    console.log("\n🔗 View contract on HashScan:");
    console.log(`Test: https://hashscan.io/testnet/contract/${testContractId.toString()}`);

    console.log("\n📝 Next steps for mainnet deployment:");
    console.log("1. Get real mainnet HBAR");
    console.log("2. Update .env with mainnet credentials");
    console.log("3. Run: node scripts/deployMainnet.js");
    console.log("4. Integrate with frontend");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
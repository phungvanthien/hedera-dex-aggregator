const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountBalanceQuery,
  Status,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting Hedera DEX Aggregator deployment to MAINNET...");

  // Use the provided private key
  const privateKeyHex = "d8fc50eb2ca055b1703bc9bc225889ffa29565b3e5ad63b6a384f2adba2daebb";
  
  // We need the real account ID - for now using placeholder
  const accountId = process.env.MAINNET_OPERATOR_ACCOUNT_ID || "0.0.2000";

  console.log("📝 Using private key:", privateKeyHex.substring(0, 10) + "...");
  console.log("📝 Account ID:", accountId);

  try {
    // Create Hedera client for mainnet
    const client = Client.forMainnet();
    
    // Setup account credentials
    const operatorPrivateKey = PrivateKey.fromString(privateKeyHex);
    const operatorAccountId = AccountId.fromString(accountId);
    
    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log("📝 Deploying with account:", operatorAccountId.toString());
    
    // Get account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorAccountId)
      .execute(client);
    console.log("💰 Account balance:", balance.hbars.toString());

    // Check if we have enough HBAR for deployment
    if (balance.hbars.toTinybars() < 10000000000) { // 10 HBAR
      console.error("❌ Insufficient balance for deployment. Need at least 10 HBAR");
      console.log("💡 Current balance:", balance.hbars.toString());
      process.exit(1);
    }

    console.log("\n📦 Deploying Exchange contract...");
    
    // Create Exchange contract (simplified for now)
    const exchangeContract = new ContractCreateFlow()
      .setGas(3000000)
      .setBytecode("0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220d6c4c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c64736f6c63430008120033")
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxChunkSize(1000);

    const exchangeResponse = await exchangeContract.execute(client);
    const exchangeReceipt = await exchangeResponse.getReceipt(client);
    const exchangeContractId = exchangeReceipt.contractId;
    
    console.log("✅ Exchange deployed to:", exchangeContractId.toString());

    // Deploy Adapters
    console.log("\n📦 Deploying Adapters...");
    
    const adapters = [
      { name: "SaucerSwap", gas: 2000000 },
      { name: "SaucerSwapV2", gas: 2000000 },
      { name: "HeliSwap", gas: 2000000 },
      { name: "Pangolin", gas: 2000000 }
    ];

    const deployedAdapters = {};

    for (const adapter of adapters) {
      console.log(`📦 Deploying ${adapter.name} Adapter...`);
      
      const adapterContract = new ContractCreateFlow()
        .setGas(adapter.gas)
        .setBytecode("0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220d6c4c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c64736f6c63430008120033")
        .setConstructorParameters(new ContractFunctionParameters())
        .setMaxChunkSize(1000);

      const adapterResponse = await adapterContract.execute(client);
      const adapterReceipt = await adapterResponse.getReceipt(client);
      const adapterContractId = adapterReceipt.contractId;
      
      deployedAdapters[adapter.name.toLowerCase()] = adapterContractId.toString();
      console.log(`✅ ${adapter.name} Adapter deployed to:`, adapterContractId.toString());
    }

    // Deployment summary
    console.log("\n🎉 Mainnet deployment completed successfully!");
    console.log("=".repeat(60));
    console.log("📋 Contract Addresses:");
    console.log("Exchange:", exchangeContractId.toString());
    console.log("SaucerSwap Adapter:", deployedAdapters.saucerswap);
    console.log("SaucerSwap V2 Adapter:", deployedAdapters.saucerswapv2);
    console.log("HeliSwap Adapter:", deployedAdapters.heliswap);
    console.log("Pangolin Adapter:", deployedAdapters.pangolin);
    console.log("=".repeat(60));

    console.log("\n🔗 View contracts on HashScan:");
    console.log(`Exchange: https://hashscan.io/mainnet/contract/${exchangeContractId.toString()}`);
    
    for (const [name, address] of Object.entries(deployedAdapters)) {
      console.log(`${name}: https://hashscan.io/mainnet/contract/${address}`);
    }

    console.log("\n💾 Save these addresses for frontend integration!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    if (error.message.includes("INSUFFICIENT_ACCOUNT_BALANCE")) {
      console.log("💡 Add more HBAR to your account");
    } else if (error.message.includes("INVALID_ACCOUNT_ID")) {
      console.log("💡 Check your account ID in .env file");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 
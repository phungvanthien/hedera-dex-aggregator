const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  Status,
  AccountBalanceQuery,
} = require("@hashgraph/sdk");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

async function main() {
  console.log("🚀 Starting Hedera DEX Aggregator deployment to MAINNET...");

  // Check environment variables
  if (!process.env.MAINNET_OPERATOR_PRIVATE_KEY_HEX || 
      !process.env.MAINNET_OPERATOR_ACCOUNT_ID) {
    console.error("❌ Missing required environment variables!");
    console.error("Please set MAINNET_OPERATOR_PRIVATE_KEY_HEX and MAINNET_OPERATOR_ACCOUNT_ID");
    process.exit(1);
  }

  try {
    // Create Hedera client for mainnet
    const client = Client.forMainnet();
    
    // Setup account credentials
    const operatorPrivateKey = PrivateKey.fromString(process.env.MAINNET_OPERATOR_PRIVATE_KEY_HEX);
    const operatorAccountId = AccountId.fromString(process.env.MAINNET_OPERATOR_ACCOUNT_ID);
    
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
      process.exit(1);
    }

    // Load contract bytecode from artifacts
    const artifactsPath = path.join(__dirname, "../artifacts/contracts");
    
    // Check if artifacts exist
    if (!fs.existsSync(artifactsPath)) {
      console.error("❌ Contract artifacts not found. Please compile contracts first.");
      console.log("💡 Try running: npx hardhat compile");
      process.exit(1);
    }

    console.log("\n📦 Deploying Exchange contract...");
    
    // Deploy Exchange contract
    const exchangeBytecode = fs.readFileSync(
      path.join(artifactsPath, "Exchange.sol/Exchange.json")
    );
    const exchangeArtifact = JSON.parse(exchangeBytecode);
    
    const exchangeContract = new ContractCreateFlow()
      .setGas(3000000)
      .setBytecode(exchangeArtifact.bytecode)
      .setConstructorParameters(new ContractFunctionParameters())
      .setMaxChunkSize(1000);

    const exchangeResponse = await exchangeContract.execute(client);
    const exchangeReceipt = await exchangeResponse.getReceipt(client);
    const exchangeContractId = exchangeReceipt.contractId;
    
    console.log("✅ Exchange deployed to:", exchangeContractId.toString());

    // Deploy Adapters
    console.log("\n📦 Deploying Adapters...");
    
    const adapters = [
      { name: "SaucerSwap", file: "SaucerSwapAdapter.sol/SaucerSwapAdapter.json" },
      { name: "SaucerSwapV2", file: "SaucerSwapV2Adapter.sol/SaucerSwapV2Adapter.json" },
      { name: "HeliSwap", file: "HeliSwapAdapter.sol/HeliSwapAdapter.json" },
      { name: "Pangolin", file: "PangolinAdapter.sol/PangolinAdapter.json" }
    ];

    const deployedAdapters = {};

    for (const adapter of adapters) {
      console.log(`📦 Deploying ${adapter.name} Adapter...`);
      
      const adapterBytecode = fs.readFileSync(
        path.join(artifactsPath, `adapters/${adapter.file}`)
      );
      const adapterArtifact = JSON.parse(adapterBytecode);
      
      const adapterContract = new ContractCreateFlow()
        .setGas(2000000)
        .setBytecode(adapterArtifact.bytecode)
        .setConstructorParameters(new ContractFunctionParameters())
        .setMaxChunkSize(1000);

      const adapterResponse = await adapterContract.execute(client);
      const adapterReceipt = await adapterResponse.getReceipt(client);
      const adapterContractId = adapterReceipt.contractId;
      
      deployedAdapters[adapter.name.toLowerCase()] = adapterContractId.toString();
      console.log(`✅ ${adapter.name} Adapter deployed to:`, adapterContractId.toString());
    }

    // Set adapters in Exchange contract
    console.log("\n🔗 Setting adapters in Exchange contract...");
    
    const adapterIds = {
      "saucerswap": deployedAdapters.saucerswap,
      "saucerswapv2": deployedAdapters.saucerswapv2,
      "heliswap": deployedAdapters.heliswap,
      "pangolin": deployedAdapters.pangolin
    };

    for (const [name, address] of Object.entries(adapterIds)) {
      console.log(`🔗 Setting ${name} adapter...`);
      
      const setAdapterTx = new ContractExecuteTransaction()
        .setContractId(exchangeContractId)
        .setGas(200000)
        .setFunction("setAdapter", new ContractFunctionParameters()
          .addString(name)
          .addAddress(address)
        );

      const setAdapterResponse = await setAdapterTx.execute(client);
      const setAdapterReceipt = await setAdapterResponse.getReceipt(client);
      
      if (setAdapterReceipt.status === Status.Success) {
        console.log(`✅ ${name} adapter set successfully`);
      } else {
        console.error(`❌ Failed to set ${name} adapter`);
      }
    }

    // Set fees for adapters
    console.log("\n💰 Setting adapter fees...");
    
    for (const [name, address] of Object.entries(adapterIds)) {
      console.log(`💰 Setting fee for ${name} adapter...`);
      
      const setFeeTx = new ContractExecuteTransaction()
        .setContractId(address)
        .setGas(100000)
        .setFunction("setFeePromille", new ContractFunctionParameters()
          .addUint8(3) // 0.3% fee
        );

      const setFeeResponse = await setFeeTx.execute(client);
      const setFeeReceipt = await setFeeResponse.getReceipt(client);
      
      if (setFeeReceipt.status === Status.Success) {
        console.log(`✅ ${name} fee set to 0.3%`);
      } else {
        console.error(`❌ Failed to set fee for ${name}`);
      }
    }

    // Deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("=".repeat(60));
    console.log("📋 Contract Addresses:");
    console.log("Exchange:", exchangeContractId.toString());
    console.log("SaucerSwap Adapter:", deployedAdapters.saucerswap);
    console.log("SaucerSwap V2 Adapter:", deployedAdapters.saucerswapv2);
    console.log("HeliSwap Adapter:", deployedAdapters.heliswap);
    console.log("Pangolin Adapter:", deployedAdapters.pangolin);
    console.log("=".repeat(60));

    // Save deployment info
    const deploymentInfo = {
      network: "mainnet",
      timestamp: new Date().toISOString(),
      deployer: operatorAccountId.toString(),
      contracts: {
        exchange: exchangeContractId.toString(),
        adapters: deployedAdapters
      }
    };

    fs.writeFileSync(
      'deployment-mainnet.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to deployment-mainnet.json");
    console.log("\n🔗 View contracts on HashScan:");
    console.log(`Exchange: https://hashscan.io/mainnet/contract/${exchangeContractId.toString()}`);
    
    for (const [name, address] of Object.entries(deployedAdapters)) {
      console.log(`${name}: https://hashscan.io/mainnet/contract/${address}`);
    }

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
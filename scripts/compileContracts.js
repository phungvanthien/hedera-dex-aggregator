const solc = require('solc');
const fs = require('fs');
const path = require('path');

function compileContracts() {
  console.log("🔨 Compiling Solidity contracts...");

  const contractsPath = path.join(__dirname, '../contracts');
  const artifactsPath = path.join(__dirname, '../artifacts/contracts');

  // Create artifacts directory if it doesn't exist
  if (!fs.existsSync(artifactsPath)) {
    fs.mkdirSync(artifactsPath, { recursive: true });
  }

  // Read all Solidity files
  const contracts = [];
  
  // Read main contracts
  const mainContracts = ['Exchange.sol'];
  for (const contract of mainContracts) {
    const contractPath = path.join(contractsPath, contract);
    if (fs.existsSync(contractPath)) {
      contracts.push({
        name: contract,
        path: contractPath,
        content: fs.readFileSync(contractPath, 'utf8')
      });
    }
  }

  // Read adapter contracts
  const adaptersPath = path.join(contractsPath, 'adapters');
  if (fs.existsSync(adaptersPath)) {
    const adapterFiles = fs.readdirSync(adaptersPath);
    for (const file of adapterFiles) {
      if (file.endsWith('.sol')) {
        const contractPath = path.join(adaptersPath, file);
        contracts.push({
          name: file,
          path: contractPath,
          content: fs.readFileSync(contractPath, 'utf8')
        });
      }
    }
  }

  // Read interface contracts
  const interfacesPath = path.join(contractsPath, 'interfaces');
  if (fs.existsSync(interfacesPath)) {
    const interfaceFiles = fs.readdirSync(interfacesPath);
    for (const file of interfaceFiles) {
      if (file.endsWith('.sol')) {
        const contractPath = path.join(interfacesPath, file);
        contracts.push({
          name: file,
          path: contractPath,
          content: fs.readFileSync(contractPath, 'utf8')
        });
      }
    }
  }

  // Read library contracts
  const librariesPath = path.join(contractsPath, 'libraries');
  if (fs.existsSync(librariesPath)) {
    const libraryFiles = fs.readdirSync(librariesPath);
    for (const file of libraryFiles) {
      if (file.endsWith('.sol')) {
        const contractPath = path.join(librariesPath, file);
        contracts.push({
          name: file,
          path: contractPath,
          content: fs.readFileSync(contractPath, 'utf8')
        });
      }
    }
  }

  // Prepare input for solc
  const input = {
    language: 'Solidity',
    sources: {},
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      },
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  };

  // Add all contracts to input
  for (const contract of contracts) {
    input.sources[contract.name] = {
      content: contract.content
    };
  }

  // Compile contracts
  console.log(`📦 Compiling ${contracts.length} contracts...`);
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      for (const error of errors) {
        console.error(`  ${error.formattedMessage}`);
      }
      process.exit(1);
    }
  }

  // Save compiled contracts
  let compiledCount = 0;
  
  for (const contractName in output.contracts) {
    const contract = output.contracts[contractName];
    
    for (const contractKey in contract) {
      const contractData = contract[contractKey];
      
      // Create directory for contract
      const contractDir = path.join(artifactsPath, contractName.replace('.sol', '.sol'));
      if (!fs.existsSync(contractDir)) {
        fs.mkdirSync(contractDir, { recursive: true });
      }

      // Save contract artifact
      const artifactPath = path.join(contractDir, `${contractKey}.json`);
      const artifact = {
        contractName: contractKey,
        abi: contractData.abi,
        bytecode: contractData.evm.bytecode.object,
        deployedBytecode: contractData.evm.deployedBytecode.object,
        metadata: contractData.metadata
      };

      fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
      console.log(`✅ Compiled: ${contractKey}`);
      compiledCount++;
    }
  }

  console.log(`\n🎉 Successfully compiled ${compiledCount} contracts!`);
  console.log(`📁 Artifacts saved to: ${artifactsPath}`);
}

// Check if solc is available
try {
  require('solc');
  compileContracts();
} catch (error) {
  console.error("❌ Solc not found. Installing...");
  console.log("💡 Please run: npm install solc");
  process.exit(1);
} 
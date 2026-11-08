const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.resolve(__dirname, '../contracts/ProofStampRegistry.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ProofStampRegistry.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

console.log('Compiling ProofStampRegistry.sol with Solidity 0.8.20...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach((err) => {
    console.error(err.formattedMessage);
    if (err.severity === 'error') hasErrors = true;
  });
  if (hasErrors) {
    process.exit(1);
  }
}

const contract = output.contracts['ProofStampRegistry.sol']['ProofStampRegistry'];
const artifact = {
  contractName: 'ProofStampRegistry',
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object,
  compilerVersion: '0.8.20',
  network: {
    name: 'BOT Chain Mainnet',
    chainId: 677,
    rpcUrl: 'https://rpc.botchain.ai',
    explorer: 'https://scan.botchain.ai',
  },
};

const artifactPath = path.resolve(__dirname, '../src/config/contractArtifact.json');
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
console.log(`Compilation successful! Artifact saved to ${artifactPath}`);
console.log(`Bytecode size: ${artifact.bytecode.length / 2} bytes`);

const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../src/config/contractArtifact.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Load .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const botChain = {
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.botchain.ai'] } },
  blockExplorers: { default: { name: 'BOTScan', url: 'https://scan.botchain.ai' } },
};

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('NOTE: No PRIVATE_KEY environment variable provided.');
    console.log('To deploy to BOT Chain from CLI, run:');
    console.log('  PRIVATE_KEY=0x... node scripts/deploy.cjs');
    console.log('You can also deploy directly via the ProofStamp web dApp with 1 click using MetaMask or Remix!');
    return;
  }

  const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
  console.log(`Deploying ProofStampRegistry to BOT Chain Mainnet (Chain ID: 677)...`);
  console.log(`Deployer address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: botChain,
    transport: http('https://rpc.botchain.ai'),
  });

  const walletClient = createWalletClient({
    account,
    chain: botChain,
    transport: http('https://rpc.botchain.ai'),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer balance: ${balance} wei`);

  console.log('Sending deployment transaction...');
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  });

  console.log(`Transaction sent! Tx Hash: ${hash}`);
  console.log(`Explorer: https://scan.botchain.ai/tx/${hash}`);
  console.log('Waiting for receipt...');

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Contract deployed successfully!`);
  console.log(`Contract Address: ${receipt.contractAddress}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

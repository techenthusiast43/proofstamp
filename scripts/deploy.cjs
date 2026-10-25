const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../src/config/contractArtifact.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const botChain = {
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.bohr.life'] } },
  blockExplorers: { default: { name: 'BohrScan', url: 'https://scan.bohr.life' } },
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
  console.log(`Deploying ProofStampRegistry from address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: botChain,
    transport: http('https://rpc.bohr.life'),
  });

  const walletClient = createWalletClient({
    account,
    chain: botChain,
    transport: http('https://rpc.bohr.life'),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer balance: ${balance} wei`);

  console.log('Sending deployment transaction...');
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
  });

  console.log(`Transaction sent! Tx Hash: ${hash}`);
  console.log(`Explorer: https://scan.bohr.life/tx/${hash}`);
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

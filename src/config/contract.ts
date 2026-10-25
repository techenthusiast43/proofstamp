import { defineChain } from 'viem';

// BOT Chain Testnet Definition
export const botChain = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

export const BOT_CHAIN_INFO = {
  chainId: 968,
  name: 'BOT Chain Testnet',
  rpcUrl: 'https://rpc.bohr.life',
  explorerUrl: 'https://scan.bohr.life',
  symbol: 'BOT',
  decimals: 18,
  totalSupply: '150 Million',
};

// Default contract address (can be set via VITE_CONTRACT_ADDRESS or in-app settings)
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x72A3Fa41d63806C623C85E5Ff04499645607b1aD'; // Configurable / sample fallback address

export const PROOF_STAMP_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: 'documentHash', type: 'bytes32' }],
    name: 'registerProof',
    outputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'revokeProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    name: 'getProof',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'bool', name: 'revoked', type: 'bool' },
        ],
        internalType: 'struct ProofStampRegistry.Proof',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'documentHash', type: 'bytes32' }],
    name: 'getProofsByHash',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'bool', name: 'revoked', type: 'bool' },
        ],
        internalType: 'struct ProofStampRegistry.Proof[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'documentHash', type: 'bytes32' }],
    name: 'verifyProof',
    outputs: [
      { internalType: 'bool', name: 'exists', type: 'bool' },
      { internalType: 'uint256', name: 'totalClaims', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'bool', name: 'revoked', type: 'bool' },
        ],
        internalType: 'struct ProofStampRegistry.Proof',
        name: 'earliestProof',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getMyProofs',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
          { internalType: 'bool', name: 'revoked', type: 'bool' },
        ],
        internalType: 'struct ProofStampRegistry.Proof[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalProofsCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'blockNumber', type: 'uint256' },
    ],
    name: 'ProofRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: true, internalType: 'bytes32', name: 'documentHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'ProofRevoked',
    type: 'event',
  },
] as const;

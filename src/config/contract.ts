import { defineChain } from 'viem';

// BOT Chain Mainnet Definition
export const botChain = defineChain({
  id: 677,
  name: 'BOT Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOTScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});

export const BOT_CHAIN_INFO = {
  chainId: 677,
  name: 'BOT Chain Mainnet',
  websiteUrl: 'https://botchain.ai',
  rpcUrl: 'https://rpc.botchain.ai',
  explorerUrl: 'https://scan.botchain.ai',
  symbol: 'BOT',
  decimals: 18,
  totalSupply: '150 Million',
};

// Default contract address (deployed on BOT Chain Mainnet, Chain ID: 677)
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x67b3a74bc54158c6b45a60e58bfe195f44d197e3';

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

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { injected } from 'wagmi';

// 1. Get Project ID from environment or provide fallback for local testing
export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID ||
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  'c4f79cc821944d9680842e34466bfbd'; // Fallback demo ID

// 2. Define BOT Chain Mainnet as a CaipNetwork for AppKit & Wagmi
export const botChainNetwork = defineChain({
  id: 677,
  caipNetworkId: 'eip155:677',
  chainNamespace: 'eip155',
  name: 'BOT Chain Mainnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
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
});

export const networks = [botChainNetwork];

// 3. Set up Wagmi Adapter with injected provider + wallet connectors
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  connectors: [
    injected({ shimDisconnect: true }),
  ],
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// 4. Create AppKit instance
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChainNetwork],
  projectId,
  defaultNetwork: botChainNetwork,
  metadata: {
    name: 'ProofStamp',
    description: 'Decentralized Document Verification on BOT Chain',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://proofstamp.botchain.ai',
    icons: ['https://scan.botchain.ai/favicon.ico'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00f2fe',
    '--w3m-border-radius-master': '12px',
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 15,
      refetchOnWindowFocus: false,
    },
  },
});

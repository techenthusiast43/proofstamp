import { useState, useEffect } from 'react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from './config/web3';
import { Header } from './components/Header';
import { StampTab } from './components/StampTab';
import { VerifyTab } from './components/VerifyTab';
import { VaultTab } from './components/VaultTab';
import { ProofReceiptModal } from './components/ProofReceiptModal';
import { ContractModal } from './components/ContractModal';
import type { ProofRecord } from './types';
import { getLocalProofs, fetchUserProofs } from './services/proofStore';
import { BOT_CHAIN_INFO } from './config/contract';
import { ShieldCheck, ExternalLink, Lock } from 'lucide-react';

function MainApp() {
  const { address, isConnected } = useAccount();

  const [activeTab, setActiveTab] = useState<'stamp' | 'verify' | 'vault'>('stamp');
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [selectedProofForReceipt, setSelectedProofForReceipt] = useState<ProofRecord | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [initialVerifyHash, setInitialVerifyHash] = useState<string | undefined>(undefined);

  // Check URL params for shared verification links (?hash=0x...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get('hash') || params.get('verify');
    if (hashParam) {
      setInitialVerifyHash(hashParam);
      setActiveTab('verify');
    }
  }, []);

  // Load proofs
  const refreshProofs = async () => {
    if (isConnected && address) {
      const list = await fetchUserProofs(address as `0x${string}`);
      setProofs(list);
    } else {
      setProofs(getLocalProofs());
    }
  };

  useEffect(() => {
    refreshProofs();
  }, [address, isConnected]);

  const handleProofCreated = (newProof: ProofRecord) => {
    setProofs((prev) => [newProof, ...prev.filter((p) => p.documentHash !== newProof.documentHash || p.id !== newProof.id)]);
    setSelectedProofForReceipt(newProof);
  };

  const handleVerifyFromVault = (hash: string) => {
    setInitialVerifyHash(hash);
    setActiveTab('verify');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenContractModal={() => setIsContractModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultCount={proofs.length}
      />

      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'stamp' && (
          <StampTab
            onProofCreated={handleProofCreated}
            onViewReceipt={(p) => setSelectedProofForReceipt(p)}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyTab
            initialHash={initialVerifyHash}
            onViewReceipt={(p) => setSelectedProofForReceipt(p)}
            onGoToStamp={() => setActiveTab('stamp')}
          />
        )}

        {activeTab === 'vault' && (
          <VaultTab
            proofs={proofs}
            onViewReceipt={(p) => setSelectedProofForReceipt(p)}
            onVerifyProof={handleVerifyFromVault}
            onGoToStamp={() => setActiveTab('stamp')}
            onRefresh={refreshProofs}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '32px 24px',
        color: 'var(--text-muted)',
        fontSize: '0.84rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#00f2fe" />
            <span style={{ color: '#fff', fontWeight: 700 }}>ProofStamp</span>
            <span>• Document Verification on BOT Chain (Chain ID: {BOT_CHAIN_INFO.chainId})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#10b981" /> 100% Client-Side Hashing
            </span>
            <a
              href={BOT_CHAIN_INFO.explorerUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              BohrScan Explorer <ExternalLink size={12} />
            </a>
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              RPC: rpc.bohr.life
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProofForReceipt && (
        <ProofReceiptModal
          proof={selectedProofForReceipt}
          onClose={() => setSelectedProofForReceipt(null)}
        />
      )}

      {isContractModalOpen && (
        <ContractModal
          onClose={() => setIsContractModalOpen(false)}
          onAddressUpdated={() => refreshProofs()}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MainApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

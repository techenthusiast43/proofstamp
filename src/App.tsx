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
import { BOT_CHAIN_INFO, DEFAULT_CONTRACT_ADDRESS } from './config/contract';
import { ShieldCheck, ExternalLink, Lock, ArrowUpRight } from 'lucide-react';
import { BotChainLogo } from './components/BotChainLogo';

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

      {/* BOT Chain Ecosystem Showcase Section */}
      <section style={{
        borderTop: '1px solid rgba(0, 242, 254, 0.15)',
        background: 'linear-gradient(180deg, rgba(7, 9, 14, 0.4) 0%, rgba(10, 18, 32, 0.8) 50%, rgba(5, 7, 11, 0.98) 100%)',
        padding: '50px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Ecosystem Brand & Description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '640px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)',
                flexShrink: 0,
              }}>
                <BotChainLogo size={36} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
                    Powered by BOT Chain
                  </h3>
                  <span style={{
                    background: 'rgba(0, 242, 254, 0.12)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Mainnet (Chain ID: {BOT_CHAIN_INFO.chainId})
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
                  ProofStamp secures document existence proofs using client-side SHA-256 fingerprints anchored permanently into BOT Chain's decentralized ledger.
                </p>
              </div>
            </div>

            {/* Official BOT Chain Ecosystem Action Links */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 20px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  boxShadow: '0 0 16px rgba(0, 242, 254, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                className="hover-lift"
              >
                <BotChainLogo size={18} />
                BOT Chain website
                <ArrowUpRight size={14} color="#00f2fe" />
              </a>

              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                className="hover-bright"
              >
                <BotChainLogo size={18} />
                BOT Chain explorer
                <ArrowUpRight size={14} color="#4facfe" />
              </a>
            </div>
          </div>

          {/* Ecosystem Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Official Website
              </div>
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.95rem',
                  color: '#00f2fe',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                }}
              >
                <BotChainLogo size={14} /> botchain.ai <ExternalLink size={12} />
              </a>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Block Explorer
              </div>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.95rem',
                  color: '#4facfe',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '4px',
                }}
              >
                <BotChainLogo size={14} /> scan.botchain.ai <ExternalLink size={12} />
              </a>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Registry Smart Contract
              </div>
              <a
                href={`https://scan.botchain.ai/address/${DEFAULT_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="mono"
                style={{
                  fontSize: '0.85rem',
                  color: '#10b981',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                0x67b3...97e3 <ExternalLink size={12} />
              </a>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Chain Parameters
              </div>
              <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginTop: '4px' }}>
                Chain ID 677 • BOT Token
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer with Required Ecosystem Links and Logo */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: '#040508',
        padding: '36px 24px',
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
          gap: '24px',
        }}>
          {/* ProofStamp Brand & BOT Chain Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#00f2fe" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.96rem' }}>ProofStamp</span>
            </div>
            <span style={{ color: 'var(--border-light)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BotChainLogo size={20} />
              <span style={{ color: '#fff', fontWeight: 600 }}>BOT Chain</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>(Mainnet ID: 677)</span>
            </div>
          </div>

          {/* Official BOT Chain Ecosystem Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
              className="hover-cyan"
            >
              <BotChainLogo size={16} />
              BOT Chain website
              <ExternalLink size={12} color="var(--text-muted)" />
            </a>

            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
              className="hover-cyan"
            >
              <BotChainLogo size={16} />
              BOT Chain explorer
              <ExternalLink size={12} color="var(--text-muted)" />
            </a>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <Lock size={14} /> 100% Client-Side Hashing
            </span>
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

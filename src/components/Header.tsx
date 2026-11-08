import type { FC } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { ShieldCheck, ExternalLink, Settings, Wallet, Layers, ChevronDown } from 'lucide-react';
import { BOT_CHAIN_INFO } from '../config/contract';
import { formatAddress } from '../utils/crypto';
import { getActiveContractAddress } from '../services/proofStore';
import { BotChainLogo } from './BotChainLogo';

interface HeaderProps {
  onOpenContractModal: () => void;
  activeTab: 'stamp' | 'verify' | 'vault';
  setActiveTab: (tab: 'stamp' | 'verify' | 'vault') => void;
  vaultCount: number;
}

export const Header: FC<HeaderProps> = ({
  onOpenContractModal,
  activeTab,
  setActiveTab,
  vaultCount,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const activeContract = getActiveContractAddress();

  const { data: balanceData } = useBalance({
    address,
  });

  const isCorrectChain = chain?.id === BOT_CHAIN_INFO.chainId;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 14, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)',
          }}>
            <ShieldCheck size={24} color="#00f2fe" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.28rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Proof<span className="gradient-text">Stamp</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                BOT Chain
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Decentralized Document Existence Registry
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => setActiveTab('stamp')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'stamp' ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
              color: activeTab === 'stamp' ? '#07090e' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Stamp Document
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'verify' ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
              color: activeTab === 'verify' ? '#07090e' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Verify Integrity
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'vault' ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
              color: activeTab === 'vault' ? '#07090e' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            My Vault
            {vaultCount > 0 && (
              <span style={{
                background: activeTab === 'vault' ? '#07090e' : 'rgba(255, 255, 255, 0.15)',
                color: activeTab === 'vault' ? '#00f2fe' : '#fff',
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: '2px',
              }}>
                {vaultCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Network indicator pill */}
          <a
            href={BOT_CHAIN_INFO.explorerUrl}
            target="_blank"
            rel="noreferrer"
            title="Open BOTScan Explorer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 23, 41, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            className="hover-bright"
          >
            <span className="pulse-dot" style={{ background: isCorrectChain ? '#10b981' : '#f59e0b' }} />
            <BotChainLogo size={15} />
            <span>BOT Chain {BOT_CHAIN_INFO.chainId}</span>
            <ExternalLink size={12} color="var(--text-muted)" />
          </a>

          {/* Contract address modal trigger */}
          <button
            onClick={onOpenContractModal}
            title="Inspect / Configure Smart Contract"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={14} color="#00f2fe" />
            <span className="mono">{formatAddress(activeContract, 3)}</span>
            <Settings size={13} color="var(--text-muted)" />
          </button>

          {/* Connect / Wallet button */}
          {isConnected && address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => open()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid rgba(0, 242, 254, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  color: '#fff',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00f2fe',
                }} />
                <span className="mono">{formatAddress(address)}</span>
                {balanceData && (
                  <span style={{ color: '#00f2fe', fontSize: '0.78rem', marginLeft: '4px' }}>
                    {parseFloat(balanceData.formatted).toFixed(3)} {balanceData.symbol}
                  </span>
                )}
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              <button
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  color: '#fb7185',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => open()}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

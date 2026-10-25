import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import {
  FileText,
  ShieldCheck,
  Share2,
  Download,
  Search,
  ExternalLink,
  Ban,
  Check,
} from 'lucide-react';
import type { ProofRecord } from '../types';
import { formatBytes, formatTimestamp, getExplorerTxUrl } from '../utils/crypto';
import { PROOF_STAMP_ABI } from '../config/contract';
import { getActiveContractAddress, saveLocalProofMetadata } from '../services/proofStore';

interface VaultTabProps {
  proofs: ProofRecord[];
  onViewReceipt: (proof: ProofRecord) => void;
  onVerifyProof: (hash: string) => void;
  onGoToStamp: () => void;
  onRefresh: () => void;
}

export const VaultTab: FC<VaultTabProps> = ({
  proofs,
  onViewReceipt,
  onVerifyProof,
  onGoToStamp,
  onRefresh,
}) => {
  const { isConnected } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const activeContract = getActiveContractAddress();
  const { writeContractAsync } = useWriteContract();

  const filteredProofs = proofs.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.fileName && p.fileName.toLowerCase().includes(term)) ||
      p.documentHash.toLowerCase().includes(term) ||
      p.id.toString().includes(term)
    );
  });

  const copyShareLink = (p: ProofRecord) => {
    const link = `${window.location.origin}?hash=${p.documentHash}`;
    navigator.clipboard.writeText(link);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (proof: ProofRecord) => {
    if (!confirm(`Are you sure you want to revoke proof #${proof.id}? This will flag the record as revoked on-chain without erasing history.`)) {
      return;
    }

    setRevokingId(proof.id);
    try {
      await writeContractAsync({
        address: activeContract,
        abi: PROOF_STAMP_ABI,
        functionName: 'revokeProof',
        args: [BigInt(proof.id)],
      });
    } catch (err) {
      console.warn('Revoke on-chain error or local testing:', err);
    }

    // Update local record
    const updated: ProofRecord = { ...proof, revoked: true };
    saveLocalProofMetadata(updated);
    setRevokingId(null);
    onRefresh();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            My Document <span className="gradient-text">Vault</span>
          </h1>
          <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage and verify your documents registered on BOT Chain Testnet
          </p>
        </div>

        <button onClick={onGoToStamp} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
          <ShieldCheck size={16} />
          Stamp New Document
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          position: 'relative',
          maxWidth: '480px',
        }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by file name, hash, or record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px 10px 38px',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredProofs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
          }}>
            <FileText size={28} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            {searchTerm ? 'No matching records found' : 'No stamped documents yet'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            {searchTerm
              ? 'Try searching with a different file name or SHA-256 hash.'
              : 'Stamp your first contract, draft, or code deliverable to establish an immutable timestamp on BOT Chain.'}
          </p>
          <button onClick={onGoToStamp} className="btn-primary" style={{ padding: '10px 22px' }}>
            Stamp a Document Now
          </button>
        </div>
      ) : (
        /* Proofs Grid / Cards */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredProofs.map((p) => {
            const time = formatTimestamp(p.timestamp);
            return (
              <div
                key={p.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderColor: p.revoked ? 'rgba(244, 63, 94, 0.3)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: p.revoked
                      ? 'rgba(244, 63, 94, 0.1)'
                      : 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))',
                    border: `1px solid ${p.revoked ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-glow)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {p.revoked ? (
                      <Ban size={22} color="#fb7185" />
                    ) : (
                      <FileText size={22} color="#00f2fe" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                        {p.fileName || 'Document Record'}
                      </h4>
                      <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        #{p.id}
                      </span>
                      {p.revoked && (
                        <span className="badge badge-rose" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          Revoked
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>{time.formatted} ({time.relative})</span>
                      {p.fileSize && <span>• {formatBytes(p.fileSize)}</span>}
                      <span>• Block {p.blockNumber.toLocaleString()}</span>
                    </div>

                    <p className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', wordBreak: 'break-all' }}>
                      {p.documentHash.slice(0, 24)}...{p.documentHash.slice(-18)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onViewReceipt(p)}
                    className="btn-outline-cyan"
                    title="View Official Certificate Receipt"
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <Download size={14} />
                    Receipt
                  </button>

                  <button
                    onClick={() => onVerifyProof(p.documentHash)}
                    className="btn-secondary"
                    title="Audit Verification on BOT Chain"
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                  >
                    <ShieldCheck size={14} color="#10b981" />
                    Verify
                  </button>

                  <button
                    onClick={() => copyShareLink(p)}
                    className="btn-secondary"
                    title="Copy Shareable Verification URL"
                    style={{ padding: '8px 12px' }}
                  >
                    {copiedId === p.id ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                  </button>

                  {p.txHash && (
                    <a
                      href={getExplorerTxUrl(p.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      title="View Transaction on BohrScan"
                      style={{ padding: '8px 12px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {!p.revoked && isConnected && (
                    <button
                      onClick={() => handleRevoke(p)}
                      disabled={revokingId === p.id}
                      className="btn-secondary"
                      title="Revoke Proof Claim"
                      style={{
                        padding: '8px 12px',
                        color: '#fb7185',
                        borderColor: 'rgba(244, 63, 94, 0.25)',
                      }}
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

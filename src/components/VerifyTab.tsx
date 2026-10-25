import { useState, useEffect, useRef } from 'react';
import type { FC, DragEvent } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type { VerificationResult, ProofRecord } from '../types';
import { calculateFileHash, formatTimestamp, formatAddress, isValidBytes32Hash } from '../utils/crypto';
import { verifyDocumentOnChain, getActiveContractAddress } from '../services/proofStore';
import { BOT_CHAIN_INFO } from '../config/contract';

interface VerifyTabProps {
  initialHash?: string;
  onViewReceipt: (proof: ProofRecord) => void;
  onGoToStamp: () => void;
}

export const VerifyTab: FC<VerifyTabProps> = ({ initialHash, onViewReceipt, onGoToStamp }) => {
  const [mode, setMode] = useState<'file' | 'hash'>('file');
  const [inputHash, setInputHash] = useState(initialHash || '');
  const [dragActive, setDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeContract = getActiveContractAddress();

  const runVerification = async (hashToVerify: string) => {
    const cleanHash = hashToVerify.trim();
    if (!isValidBytes32Hash(cleanHash)) {
      setErrorMsg('Please enter a valid 32-byte hexadecimal hash (starting with 0x and 64 hex characters).');
      setResult(null);
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      const res = await verifyDocumentOnChain(cleanHash as `0x${string}`, activeContract);
      setResult(res);
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMsg('Verification lookup failed: ' + (err.message || 'Unknown error'));
      setResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (initialHash && isValidBytes32Hash(initialHash)) {
      setInputHash(initialHash);
      setMode('hash');
      runVerification(initialHash);
    }
  }, [initialHash]);

  const handleFile = async (file: File) => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const { hash } = await calculateFileHash(file);
      setInputHash(hash);
      await runVerification(hash);
    } catch (err: any) {
      setErrorMsg('Failed to process file: ' + err.message);
      setIsVerifying(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', marginBottom: '10px' }}>
          Verify <span className="gradient-text">Document Integrity</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Check if a document exists in its exact original state on BOT Chain.
          Detect any modifications, verify the original registration timestamp, and view independent claims.
        </p>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'inline-flex',
        }}>
          <button
            onClick={() => { setMode('file'); setResult(null); setErrorMsg(''); }}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'file' ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
              color: mode === 'file' ? '#07090e' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Upload File to Check
          </button>
          <button
            onClick={() => { setMode('hash'); setResult(null); setErrorMsg(''); }}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'hash' ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
              color: mode === 'hash' ? '#07090e' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Lookup by SHA-256 Hash
          </button>
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px' }}>
        {mode === 'file' ? (
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)'}`,
              borderRadius: 'var(--radius-lg)',
              background: dragActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.015)',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))',
              border: '1px solid var(--border-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              {isVerifying ? (
                <Loader2 size={28} color="#00f2fe" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Search size={28} color="#00f2fe" />
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {isVerifying ? 'Verifying with BOT Chain...' : 'Drop document here to verify authenticity'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Computes hash locally and instantly scans BOT Chain registry
            </p>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Enter 32-Byte SHA-256 Hash:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="0x9a8f... or paste full 64-char hex hash"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runVerification(inputHash);
                }}
                className="mono"
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => runVerification(inputHash)}
                disabled={isVerifying || !inputHash.trim()}
                className="btn-primary"
                style={{ minWidth: '130px' }}
              >
                {isVerifying ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Search size={16} />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#fb7185',
            fontSize: '0.86rem',
          }}>
            {errorMsg}
          </div>
        )}

        {/* Verification Result Area */}
        {result && (
          <div style={{ marginTop: '28px', animation: 'fadeIn 0.3s ease-out' }}>
            {result.exists && result.earliestProof ? (
              // MATCH FOUND
              <div style={{
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(7, 9, 14, 0.8) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--glow-emerald)',
                  }}>
                    <CheckCircle2 size={28} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
                      Document Authentic & Verified
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      This file matches the exact digital fingerprint registered on BOT Chain.
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '14px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Genesis Registration
                    </span>
                    <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      {formatTimestamp(result.earliestProof.timestamp).formatted}
                    </p>
                    <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>
                      {formatTimestamp(result.earliestProof.timestamp).relative} (Block {result.earliestProof.blockNumber.toLocaleString()})
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Genesis Stamped By
                    </span>
                    <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                      <a
                        href={`${BOT_CHAIN_INFO.explorerUrl}/address/${result.earliestProof.creator}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span className="mono">{formatAddress(result.earliestProof.creator, 5)}</span>
                        <ExternalLink size={12} />
                      </a>
                    </p>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Record #{result.earliestProof.id}
                    </span>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                  }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total On-Chain Claims
                    </span>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                      {result.totalClaims} {result.totalClaims === 1 ? 'Party' : 'Independent Parties'}
                    </p>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Multi-party timestamp enabled
                    </span>
                  </div>
                </div>

                {/* Hash details */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '20px',
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Matching Document Hash
                  </span>
                  <p className="mono" style={{ fontSize: '0.82rem', color: '#e2e8f0', wordBreak: 'break-all', marginTop: '4px' }}>
                    {result.hash}
                  </p>
                </div>

                {/* Multi-claim timeline */}
                {result.allProofs && result.allProofs.length > 1 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      Registration History Timeline ({result.allProofs.length} claims):
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.allProofs.map((p, idx) => (
                        <div
                          key={p.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '10px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: idx === 0 ? 'var(--accent-emerald)' : '#fff' }}>
                              Claim #{idx + 1} (Record #{p.id}):
                            </span>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>
                              {formatTimestamp(p.timestamp).formatted}
                            </span>
                          </div>
                          <span className="mono" style={{ color: 'var(--accent-cyan)' }}>
                            {formatAddress(p.creator, 4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onViewReceipt(result.earliestProof!)}
                    className="btn-primary"
                    style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  >
                    <ShieldCheck size={16} />
                    View & Download Official Receipt
                  </button>
                  <a
                    href={`${BOT_CHAIN_INFO.explorerUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.9rem', textDecoration: 'none' }}
                  >
                    BohrScan Explorer <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ) : (
              // NO MATCH FOUND
              <div style={{
                background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, rgba(7, 9, 14, 0.8) 100%)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid #f43f5e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <XCircle size={28} color="#f43f5e" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fb7185' }}>
                      No On-Chain Match Found
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      This exact file fingerprint does not exist in the BOT Chain registry.
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '20px',
                }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Calculated Hash Checked
                  </span>
                  <p className="mono" style={{ fontSize: '0.82rem', color: '#e2e8f0', wordBreak: 'break-all', marginTop: '4px' }}>
                    {result.hash}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  lineHeight: 1.6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
                    <AlertTriangle size={16} />
                    Why did verification fail?
                  </div>
                  Even changing a single character, whitespace, or byte completely alters the SHA-256 hash. If this document was modified after being issued, its fingerprint will not match the original.
                </div>

                <button
                  onClick={onGoToStamp}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  Stamp This Document Now
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

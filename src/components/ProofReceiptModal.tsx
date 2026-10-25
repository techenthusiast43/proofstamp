import { useState, useRef } from 'react';
import type { FC } from 'react';
import type { ProofRecord } from '../types';
import { formatAddress, formatBytes, formatTimestamp, getExplorerTxUrl, getExplorerAddressUrl } from '../utils/crypto';
import { BOT_CHAIN_INFO } from '../config/contract';
import { ShieldCheck, Download, Printer, ExternalLink, Check, Copy, Share2, X } from 'lucide-react';

interface ProofReceiptModalProps {
  proof: ProofRecord | null;
  onClose: () => void;
}

export const ProofReceiptModal: FC<ProofReceiptModalProps> = ({ proof, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!proof) return null;

  const time = formatTimestamp(proof.timestamp);
  const verifyUrl = `${window.location.origin}?hash=${proof.documentHash}`;

  const copyHash = () => {
    navigator.clipboard.writeText(proof.documentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadJson = () => {
    const receiptData = {
      title: 'ProofStamp Cryptographic Verification Receipt',
      standard: 'EIP-BOT-Proof-v1',
      network: BOT_CHAIN_INFO,
      recordId: proof.id,
      documentHash: proof.documentHash,
      creator: proof.creator,
      timestamp: proof.timestamp,
      timestampFormatted: time.formatted,
      blockNumber: proof.blockNumber,
      txHash: proof.txHash || 'Pending / Confirmed',
      fileName: proof.fileName || 'document',
      fileSize: proof.fileSize,
      fileType: proof.fileType,
      verificationUrl: verifyUrl,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofstamp-${proof.fileName ? proof.fileName.replace(/\.[^/.]+$/, '') : 'receipt'}-${proof.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '0' }}
      >
        {/* Certificate Card */}
        <div
          ref={printRef}
          className="certificate-card"
          style={{
            background: 'linear-gradient(180deg, #0e172a 0%, #07090e 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background seal */}
          <div style={{
            position: 'absolute',
            right: '-30px',
            bottom: '-30px',
            opacity: 0.04,
            pointerEvents: 'none',
          }}>
            <ShieldCheck size={320} color="#00f2fe" />
          </div>

          {/* Close button (hidden on print) */}
          <button
            onClick={onClose}
            className="no-print"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
              border: '1px solid var(--border-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-cyan)',
            }}>
              <ShieldCheck size={28} color="#00f2fe" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  Certificate of Existence
                </h3>
                <span className="badge badge-emerald">
                  <Check size={12} /> Stamped on BOT Chain
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Immutable On-Chain Document Fingerprint & Timestamp Proof
              </p>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Document Name
              </span>
              <p style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff', marginTop: '4px', wordBreak: 'break-all' }}>
                {proof.fileName || 'Untitled Document'}
              </p>
              {proof.fileSize && (
                <span style={{ fontSize: '0.76rem', color: 'var(--accent-cyan)' }}>
                  {formatBytes(proof.fileSize)} {proof.fileType ? `• ${proof.fileType}` : ''}
                </span>
              )}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Record ID / Block Height
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                #{proof.id}{' '}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  (Block {proof.blockNumber.toLocaleString()})
                </span>
              </p>
            </div>
          </div>

          {/* Document SHA-256 Fingerprint */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SHA-256 Digital Fingerprint
              </span>
              <button
                onClick={copyHash}
                className="no-print"
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied Hash' : 'Copy Hash'}
              </button>
            </div>
            <p className="mono" style={{ fontSize: '0.82rem', color: '#e2e8f0', wordBreak: 'break-all', lineHeight: 1.5 }}>
              {proof.documentHash}
            </p>
          </div>

          {/* Timestamp & Registrant Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            fontSize: '0.84rem',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>
                On-Chain Timestamp:
              </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{time.formatted}</span>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '0.74rem', display: 'block' }}>
                ({time.relative})
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>
                Stamped By:
              </span>
              <a
                href={getExplorerAddressUrl(proof.creator)}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--accent-blue)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span className="mono">{formatAddress(proof.creator, 6)}</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {proof.txHash && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>
                  Transaction:
                </span>
                <a
                  href={getExplorerTxUrl(proof.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="mono">{formatAddress(proof.txHash, 5)}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Verification Link Banner */}
          <div style={{
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px dashed var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Public Verification Link
              </span>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {verifyUrl}
              </span>
            </div>
            <button
              onClick={copyVerifyLink}
              className="no-print btn-outline-cyan"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            >
              {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
              {copiedLink ? 'Copied' : 'Share'}
            </button>
          </div>

          {/* Action Buttons (hidden on print) */}
          <div className="no-print" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={downloadJson} className="btn-primary" style={{ flex: 1, minWidth: '180px' }}>
              <Download size={16} />
              Download Receipt (JSON)
            </button>
            <button onClick={handlePrint} className="btn-secondary" style={{ flex: 1, minWidth: '160px' }}>
              <Printer size={16} />
              Print Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

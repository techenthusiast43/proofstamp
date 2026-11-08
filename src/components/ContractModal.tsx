import { useState } from 'react';
import type { FC } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  Layers,
  Check,
  Rocket,
  Loader2,
  X,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { BOT_CHAIN_INFO } from '../config/contract';
import { getActiveContractAddress, setActiveContractAddress } from '../services/proofStore';
import artifact from '../config/contractArtifact.json';
import { BotChainLogo } from './BotChainLogo';

interface ContractModalProps {
  onClose: () => void;
  onAddressUpdated: (newAddress: `0x${string}`) => void;
}

export const ContractModal: FC<ContractModalProps> = ({ onClose, onAddressUpdated }) => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const currentActive = getActiveContractAddress();
  const [inputAddress, setInputAddress] = useState<string>(currentActive);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState('');
  const [deployedTxHash, setDeployedTxHash] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = inputAddress.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      alert('Please enter a valid 20-byte EVM contract address (0x...)');
      return;
    }
    setActiveContractAddress(trimmed as `0x${string}`);
    onAddressUpdated(trimmed as `0x${string}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const addBotChainToWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x2a5', // 677 in hex
              chainName: 'BOT Chain Mainnet',
              nativeCurrency: {
                name: 'BOT',
                symbol: 'BOT',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.botchain.ai'],
              blockExplorerUrls: ['https://scan.botchain.ai'],
            },
          ],
        });
      } catch (err: any) {
        alert('Failed to add chain: ' + err.message);
      }
    } else {
      alert('MetaMask or Web3 wallet extension not detected in this browser.');
    }
  };

  const handleDeployContract = async () => {
    if (!isConnected || !walletClient) {
      alert('Please connect your wallet first to deploy the contract.');
      return;
    }

    setIsDeploying(true);
    setDeployError('');
    setDeployedTxHash(null);

    try {
      const hash = await walletClient.deployContract({
        abi: artifact.abi as any,
        bytecode: artifact.bytecode as `0x${string}`,
      });

      setDeployedTxHash(hash);

      // Listen for deployment receipt
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const checkReceipt = async () => {
          try {
            const receipt = await (window as any).ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [hash],
            });
            if (receipt && receipt.contractAddress) {
              const newAddr = receipt.contractAddress as `0x${string}`;
              setInputAddress(newAddr);
              setActiveContractAddress(newAddr);
              onAddressUpdated(newAddr);
              setIsDeploying(false);
              return;
            }
          } catch {}
          setTimeout(checkReceipt, 2000);
        };
        setTimeout(checkReceipt, 2000);
      } else {
        setIsDeploying(false);
      }
    } catch (err: any) {
      console.error('Deploy error:', err);
      setDeployError(err.shortMessage || err.message || 'Deployment rejected or failed');
      setIsDeploying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="#00f2fe" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              BOT Chain & Contract Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Network Spec Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '0.84rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BotChainLogo size={20} />
              <span style={{ fontWeight: 700, color: '#fff' }}>BOT Chain Mainnet</span>
            </div>
            <button
              onClick={addBotChainToWallet}
              className="btn-outline-cyan"
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            >
              <PlusCircle size={12} /> Add to MetaMask
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', color: 'var(--text-muted)' }}>
            <div>Chain ID: <span style={{ color: '#fff' }}>{BOT_CHAIN_INFO.chainId} (0x2a5)</span></div>
            <div>Token: <span style={{ color: '#fff' }}>{BOT_CHAIN_INFO.symbol}</span></div>
            <div style={{ gridColumn: 'span 2' }}>
              Website:{' '}
              <a href="https://botchain.ai" target="_blank" rel="noreferrer" style={{ color: '#00f2fe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BotChainLogo size={13} /> https://botchain.ai <ExternalLink size={11} />
              </a>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              Explorer:{' '}
              <a href={BOT_CHAIN_INFO.explorerUrl} target="_blank" rel="noreferrer" style={{ color: '#4facfe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BotChainLogo size={13} /> {BOT_CHAIN_INFO.explorerUrl} <ExternalLink size={11} />
              </a>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              RPC: <span className="mono" style={{ color: '#94a3b8' }}>{BOT_CHAIN_INFO.rpcUrl}</span>
            </div>
          </div>
        </div>

        {/* Active Contract Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Active ProofStampRegistry Contract Address:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              className="mono"
              placeholder="0x..."
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button onClick={handleSave} className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.86rem' }}>
              {savedSuccess ? <Check size={16} /> : 'Save'}
            </button>
          </div>
          {savedSuccess && (
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '6px' }}>
              Contract address updated successfully!
            </p>
          )}
        </div>

        {/* 1-Click Deploy Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(99, 102, 241, 0.05))',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Rocket size={18} color="#00f2fe" />
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
              1-Click Deploy ProofStampRegistry
            </h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Deploy your own fresh instance of the Solidity contract to BOT Chain directly using your connected wallet.
          </p>

          {deployError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              color: '#fb7185',
              fontSize: '0.8rem',
              marginBottom: '12px',
            }}>
              {deployError}
            </div>
          )}

          {deployedTxHash && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              color: '#34d399',
              fontSize: '0.8rem',
              marginBottom: '12px',
            }}>
              Deploy Tx Sent: <a href={`${BOT_CHAIN_INFO.explorerUrl}/tx/${deployedTxHash}`} target="_blank" rel="noreferrer" style={{ color: '#00f2fe' }}>View on BOTScan</a>. Waiting for block confirmation...
            </div>
          )}

          <button
            onClick={handleDeployContract}
            disabled={isDeploying || !isConnected}
            className="btn-outline-cyan"
            style={{ width: '100%', padding: '10px 16px', fontSize: '0.88rem' }}
          >
            {isDeploying ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Deploying Contract to BOT Chain...
              </>
            ) : !isConnected ? (
              'Connect Wallet to Deploy'
            ) : (
              <>
                <Rocket size={16} /> Deploy New Contract to BOT Chain
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          ProofStamp contract source code is located in <code>contracts/ProofStampRegistry.sol</code>
        </p>
      </div>
    </div>
  );
};

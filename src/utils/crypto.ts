import { BOT_CHAIN_INFO } from '../config/contract';

/**
 * Calculates SHA-256 cryptographic hash of a file completely on client-side.
 * The file never leaves the user's machine.
 */
export async function calculateFileHash(file: File): Promise<{
  hash: `0x${string}`;
  rawHex: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const rawHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const hash = `0x${rawHex}` as `0x${string}`;

  return { hash, rawHex };
}

/**
 * Calculate SHA-256 hash of a plain text string.
 */
export async function calculateTextHash(text: string): Promise<`0x${string}`> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const rawHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${rawHex}` as `0x${string}`;
}

/**
 * Formats an Ethereum/EVM address for display (0x1234...5678).
 */
export function formatAddress(address?: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formats file size into human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Formats on-chain Unix timestamp (seconds) to readable string.
 */
export function formatTimestamp(timestamp: number | bigint): {
  formatted: string;
  relative: string;
  iso: string;
} {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp * 1000;
  const date = new Date(ms);

  const formatted = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const now = Date.now();
  const diffSec = Math.floor((now - ms) / 1000);
  let relative = 'just now';

  if (diffSec >= 86400) {
    const days = Math.floor(diffSec / 86400);
    relative = `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffSec >= 3600) {
    const hours = Math.floor(diffSec / 3600);
    relative = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    relative = `${mins} min${mins > 1 ? 's' : ''} ago`;
  } else if (diffSec > 5) {
    relative = `${diffSec}s ago`;
  }

  return {
    formatted,
    relative,
    iso: date.toISOString(),
  };
}

/**
 * Generates explorer URL for transaction.
 */
export function getExplorerTxUrl(txHash?: string): string {
  if (!txHash) return BOT_CHAIN_INFO.explorerUrl;
  return `${BOT_CHAIN_INFO.explorerUrl.replace(/\/$/, '')}/tx/${txHash}`;
}

/**
 * Generates explorer URL for address.
 */
export function getExplorerAddressUrl(address?: string): string {
  if (!address) return BOT_CHAIN_INFO.explorerUrl;
  return `${BOT_CHAIN_INFO.explorerUrl.replace(/\/$/, '')}/address/${address}`;
}

/**
 * Validates if string is a valid 32-byte hex hash.
 */
export function isValidBytes32Hash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash.trim());
}

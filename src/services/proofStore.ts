import type { ProofRecord, VerificationResult } from '../types';
import { PROOF_STAMP_ABI, DEFAULT_CONTRACT_ADDRESS, BOT_CHAIN_INFO } from '../config/contract';
import { createPublicClient, http } from 'viem';
import { botChain } from '../config/contract';

const STORAGE_KEY = 'proofstamp_local_records_v1';
const CONTRACT_STORAGE_KEY = 'proofstamp_active_contract_address';

// Create a direct public client for reading from BOT Chain
export const publicClient = createPublicClient({
  chain: botChain,
  transport: http(BOT_CHAIN_INFO.rpcUrl),
});

/**
 * Get active contract address from localStorage or fallback to default
 */
export function getActiveContractAddress(): `0x${string}` {
  const saved = localStorage.getItem(CONTRACT_STORAGE_KEY);
  if (saved && /^0x[0-9a-fA-F]{40}$/.test(saved)) {
    return saved as `0x${string}`;
  }
  return DEFAULT_CONTRACT_ADDRESS;
}

/**
 * Save active contract address
 */
export function setActiveContractAddress(address: `0x${string}`): void {
  localStorage.setItem(CONTRACT_STORAGE_KEY, address);
}

/**
 * Local cache for metadata (file names, sizes) that aren't stored on-chain for privacy
 */
export function saveLocalProofMetadata(proof: Partial<ProofRecord> & { documentHash: `0x${string}` }) {
  try {
    const existing = getLocalProofs();
    const updated = [proof as ProofRecord, ...existing.filter((p) => p.documentHash.toLowerCase() !== proof.documentHash.toLowerCase() || p.id !== proof.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save proof metadata locally', err);
  }
}

export function getLocalProofs(): ProofRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Query verification status directly from BOT Chain
 */
export async function verifyDocumentOnChain(
  hash: `0x${string}`,
  contractAddress: `0x${string}` = getActiveContractAddress()
): Promise<VerificationResult> {
  const localMetadataList = getLocalProofs().filter(
    (p) => p.documentHash.toLowerCase() === hash.toLowerCase()
  );

  try {
    // 1. Try reading directly from the deployed contract on BOT Chain
    const result = (await publicClient.readContract({
      address: contractAddress,
      abi: PROOF_STAMP_ABI,
      functionName: 'verifyProof',
      args: [hash],
    })) as [boolean, bigint, any];

    const [exists, totalClaimsBig, earliestRaw] = result;

    if (exists && earliestRaw && earliestRaw.id > 0n) {
      // Also fetch all proofs for this hash to show multi-registration timeline
      const allRaw = (await publicClient.readContract({
        address: contractAddress,
        abi: PROOF_STAMP_ABI,
        functionName: 'getProofsByHash',
        args: [hash],
      })) as any[];

      const allProofs: ProofRecord[] = allRaw.map((r, idx) => {
        const localMeta = localMetadataList[idx] || localMetadataList[0];
        return {
          id: Number(r.id),
          documentHash: r.documentHash,
          creator: r.creator,
          timestamp: Number(r.timestamp),
          blockNumber: Number(r.blockNumber),
          revoked: Boolean(r.revoked),
          fileName: localMeta?.fileName,
          fileSize: localMeta?.fileSize,
          fileType: localMeta?.fileType,
          txHash: localMeta?.txHash,
        };
      });

      const earliestProof = allProofs[0];

      return {
        exists: true,
        totalClaims: Number(totalClaimsBig),
        earliestProof,
        allProofs,
        hash,
        searchedAt: Date.now(),
      };
    }
  } catch (error) {
    console.warn('On-chain contract read failed or contract not deployed yet:', error);
  }

  // 2. Fallback to local records if contract is not deployed yet or local testing
  if (localMetadataList.length > 0) {
    const earliest = localMetadataList[0];
    return {
      exists: true,
      totalClaims: localMetadataList.length,
      earliestProof: earliest,
      allProofs: localMetadataList,
      hash,
      searchedAt: Date.now(),
    };
  }

  return {
    exists: false,
    totalClaims: 0,
    hash,
    searchedAt: Date.now(),
  };
}

/**
 * Fetch all proofs registered by a specific wallet address
 */
export async function fetchUserProofs(
  userAddress: `0x${string}`,
  contractAddress: `0x${string}` = getActiveContractAddress()
): Promise<ProofRecord[]> {
  const localList = getLocalProofs().filter(
    (p) => p.creator.toLowerCase() === userAddress.toLowerCase()
  );

  try {
    const rawList = (await publicClient.readContract({
      address: contractAddress,
      abi: PROOF_STAMP_ABI,
      functionName: 'getMyProofs',
      args: [userAddress],
    })) as any[];

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((r) => {
        const local = localList.find((p) => p.id === Number(r.id) || p.documentHash.toLowerCase() === r.documentHash.toLowerCase());
        return {
          id: Number(r.id),
          documentHash: r.documentHash,
          creator: r.creator,
          timestamp: Number(r.timestamp),
          blockNumber: Number(r.blockNumber),
          revoked: Boolean(r.revoked),
          fileName: local?.fileName,
          fileSize: local?.fileSize,
          fileType: local?.fileType,
          txHash: local?.txHash,
        };
      });
    }
  } catch (err) {
    console.warn('Could not fetch user proofs from contract, returning local records:', err);
  }

  return localList;
}

export interface ProofRecord {
  id: number;
  documentHash: `0x${string}`;
  creator: `0x${string}`;
  timestamp: number;
  blockNumber: number;
  revoked: boolean;
  txHash?: `0x${string}`;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface VerificationResult {
  exists: boolean;
  totalClaims: number;
  earliestProof?: ProofRecord;
  allProofs?: ProofRecord[];
  isMatch?: boolean;
  hash: `0x${string}`;
  searchedAt: number;
}

export interface HashedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  hash: `0x${string}`;
  rawHex: string;
  lastModified: number;
}

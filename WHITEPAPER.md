# ProofStamp Whitepaper
## Decentralized Proof of Existence & Zero-Leakage Document Verification on BOT Chain

**Version:** 1.0.0  
**Date:** November 2026  
**Network:** BOT Chain Mainnet (Chain ID: 677)  
**Smart Contract:** `ProofStampRegistry.sol` (`0x67b3a74bc54158c6b45a60e58bfe195f44d197e3`)  
**Standard:** EVM-Compatible Document Timestamping & Provenance Protocol  

---

## Abstract

In modern information ecosystems, establishing the chronological provenance, authenticity, and untampered state of digital records without disclosing their underlying contents represents a critical cryptographic challenge. Traditional solutions—including centralized Time-Stamping Authorities (TSAs, RFC 3161), proprietary cloud notarization services, and physical legal registries—suffer from systemic architectural vulnerabilities: single points of failure, recurring subscription friction, jurisdictional lock-in, and catastrophic data privacy leakage.

**ProofStamp** introduces a trust-minimized, zero-leakage, decentralized document verification and Proof-of-Existence (PoE) protocol built natively on **BOT Chain Mainnet** (Chain ID: `677`). By marrying client-side cryptographic hashing (SHA-256 executed exclusively in the user’s local browser runtime via the W3C Web Crypto API) with immutable, decentralized smart contract state registries, ProofStamp guarantees that confidential documents never traverse a network or touch an external server. The protocol introduces an asymmetric multi-claim registry model that preserves genesis priority timestamps while enabling unlimited independent stakeholder verifications and non-destructive revocation. This document delineates the architectural, cryptographic, economic, and security foundations of ProofStamp.

---

## 1. Introduction & Problem Statement

### 1.1 The Digital Integrity Dilemma
Digital assets—intellectual property, research data, legal agreements, trade secrets, software binaries, and corporate governance minutes—are intrinsically mutable. A single bit flipped in a digital contract or CAD schematic alters its legal and commercial significance without leaving physical evidence of tampering.

To prove in a dispute that:
1. A specific document existed in an identical state at or before time $T_0$,
2. A specific party held or authored that document at time $T_0$, and
3. The document has experienced zero post-hoc modifications,

parties have historically relied on centralized intermediaries.

### 1.2 Limitations of Existing Methodologies

| Vector | Traditional Notary | Centralized Cloud TSA (RFC 3161) | ProofStamp Protocol |
| :--- | :--- | :--- | :--- |
| **Privacy Guarantee** | Zero (Full human exposure) | Partial (Risk of payload transmission) | **Absolute Zero-Leakage (Local SHA-256 only)** |
| **Tamper Resistance** | Low (Susceptible to fraud / loss) | Medium (Server compromise / CA expiry) | **High (Immutable BOT Chain Consensus)** |
| **Genesis Auditability**| Manual, siloed, jurisdictional | Centralized database / private logs | **Publicly verifiable EVM contract state** |
| **Multi-Party Provenance**| High operational friction | Fragmented across independent systems | **Unified on-chain multi-claim timeline** |
| **Long-Term Survivability**| Contingent on physical business continuity | Contingent on SaaS vendor solvency | **Eternal (Autonomous smart contract lifecycle)** |
| **Cost Predictability** | High fee per event | Recurring enterprise subscription | **Deterministic network gas only (BOT)** |

### 1.3 The ProofStamp Thesis
A verification protocol must operate on the principle of **Zero-Knowledge Data Preservation**: the verification layer should require zero knowledge of the underlying data payload while providing mathematical certainty of its existence and uncompromised state.

---

## 2. Cryptographic Foundations

ProofStamp relies on proven cryptographic primitives to provide irreversible, deterministic mathematical guarantees.

```
+-------------------------------------------------------------------------+
|                              CLIENT DEVICE                              |
|                                                                         |
|  [ Private File: PDF / DOCX / Code / etc. ]                             |
|                           |                                             |
|                           v                                             |
|        [ Local Web Crypto API (SubtleCrypto) ]                          |
|        - In-memory ArrayBuffer streaming                                |
|        - Zero network transmission                                      |
|                           |                                             |
|                           v                                             |
|        64-Character SHA-256 Fingerprint (bytes32)                       |
+---------------------------+---------------------------------------------+
                            |
                     (Only hash is sent)
                            |
                            v
+-------------------------------------------------------------------------+
|                        BOT CHAIN (Chain ID: 677)                        |
|                                                                         |
|                   [ ProofStampRegistry.sol ]                            |
|                                                                         |
|  - Sequential ID Allocation (nextProofId++)                             |
|  - Genesis Timestamp Registration (block.timestamp)                     |
|  - Block Height Anchor (block.number)                                   |
|  - Wallet Attribution (msg.sender)                                      |
|  - Multi-Party Chronological Append                                     |
+-------------------------------------------------------------------------+
```

### 2.1 One-Way Hashing & Pre-Image Resistance
Let $D$ denote the binary stream of arbitrary length representing a digital file:
$$D \in \{0, 1\}^*$$

The client applies the cryptographic hash function $H = \text{SHA-256}$:
$$h = H(D), \quad h \in \{0, 1\}^{256}$$

The protocol relies on three mathematical properties:
1. **Pre-image Resistance:** Given $h$, it is computationally infeasible to compute $D$ such that $H(D) = h$, with a search complexity of $\mathcal{O}(2^{256})$.
2. **Second Pre-image Resistance:** Given $D_1$, it is computationally infeasible to find $D_2 \neq D_1$ such that $H(D_1) = H(D_2)$.
3. **Collision Resistance:** It is computationally infeasible to find any pair $(D_1, D_2)$ such that $H(D_1) = H(D_2)$, with complexity bounded by the Birthday Paradox at $\mathcal{O}(2^{128})$.

### 2.2 Avalanche Effect & 1-Bit Tamper Sensitivity
ProofStamp utilizes the avalanche property of SHA-256: changing a single bit in document $D$ flips approximately $50\%$ of the output bits in $h$ unpredictably:
$$\forall D, \epsilon \in \{0, 1\}^*: \text{HammingDistance}(H(D), H(D \oplus \epsilon)) \approx 128$$

If an adversary alters a single punctuation mark, space, or metadata header in a verified contract, the resulting hash $h'$ diverges completely from the on-chain record, triggering instant tamper notification during audit.

### 2.3 Client-Side Isolation Model
ProofStamp executes all cryptographic calculations in the client browser memory using the W3C standard:
```typescript
const arrayBuffer = await file.arrayBuffer();
const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
```
No raw document bytes are ever serialized into HTTP payloads, WebSockets, or remote caching systems. The network layer observes solely the resulting 32-byte hash (`bytes32`).

---

## 3. Smart Contract Architecture (`ProofStampRegistry.sol`)

The ProofStamp smart contract is implemented in Solidity (v0.8.20) and deployed on BOT Chain. It acts as an immutable, globally accessible public ledger.

### 3.1 Data Model
The contract encapsulates document state in an optimized `Proof` structure:

```solidity
struct Proof {
    uint256 id;             // Unique monotonically increasing record index
    bytes32 documentHash;   // Canonical SHA-256 fingerprint
    address creator;        // Originating wallet address
    uint256 timestamp;      // Block timestamp of consensus confirmation
    uint256 blockNumber;    // Block height at inclusion
    bool revoked;           // Revocation status flag
}
```

### 3.2 State Storage & Indexing Strategy
To optimize EVM gas consumption while supporting comprehensive query interfaces, the contract organizes state across three specialized mapping constructs:

1. **Sequential Record Store:**
   ```solidity
   mapping(uint256 => Proof) public proofs;
   ```
   Provides $\mathcal{O}(1)$ direct lookup for unique proof IDs.

2. **Hash-to-Records Multi-Claim Index:**
   ```solidity
   mapping(bytes32 => uint256[]) private hashToProofIds;
   ```
   Maintains a chronological array of record IDs registered for any given document hash. The first index element (`hashToProofIds[h][0]`) is mathematically guaranteed to be the **Genesis Record** (the earliest recorded claim of the document on BOT Chain).

3. **Creator Index:**
   ```solidity
   mapping(address => uint256[]) private userProofIds;
   ```
   Maintains an index of all claims authored by a specific public key, powering personal document vaults and audit histories.

### 3.3 Core Contract Functions

#### `registerProof(bytes32 documentHash) external returns (uint256 id)`
- **Pre-condition:** `documentHash != bytes32(0)` (guards against null hash registration).
- **Execution:**
  1. Increments `nextProofId`.
  2. Allocates and stores a new `Proof` struct using `block.timestamp` and `block.number`.
  3. Appends `id` to `hashToProofIds[documentHash]`.
  4. Appends `id` to `userProofIds[msg.sender]`.
  5. Emits `event ProofRegistered`.
- **Complexity:** $\mathcal{O}(1)$ storage operations.

#### `verifyProof(bytes32 documentHash) external view returns (bool exists, uint256 totalClaims, Proof memory earliestProof)`
- Evaluates whether `hashToProofIds[documentHash].length > 0`.
- Returns existence boolean, total registered claims count, and the complete genesis `Proof` structure in a single RPC read call without requiring transaction gas.

#### `revokeProof(uint256 id) external`
- Implements owner-authenticated non-destructive revocation.
- **Access Control:** `proof.creator == msg.sender` (reverts with `NotCreator()`).
- **State Integrity:** Reverts if already revoked (`AlreadyRevoked()`).
- Rather than deleting storage (which would destroy history), the protocol sets `revoked = true` and emits `event ProofRevoked`. Historical block timestamping remains permanently verifiable while signaling current claimant intent.

---

## 4. BOT Chain Network Integration

ProofStamp is deployed natively on **BOT Chain Mainnet**, capitalizing on its EVM compatibility, fast block times, and cost-efficient execution environment.

### 4.1 Network Specifications
- **Network Name:** BOT Chain Mainnet
- **Chain ID:** `677` (`0x2a5`)
- **Native Currency:** BOT Token (`BOT`, 18 decimals)
- **Consensus RPC Endpoint:** `https://rpc.botchain.ai`
- **Block Explorer:** `https://scan.botchain.ai`
- **Total Supply:** 150,000,000 BOT
- **Contract Address:** `0x67b3a74bc54158c6b45a60e58bfe195f44d197e3`

### 4.2 Timestamp Integrity & Miner Bounds
In EVM networks, block timestamps (`block.timestamp`) are asserted by validators and constrained by consensus drift rules:
$$\text{parent.timestamp} < \text{block.timestamp} \le \text{node.localTime} + \Delta_{\text{drift}}$$

Where typical drift tolerance $\Delta_{\text{drift}}$ is bounded within seconds. For document notarization, a second-order variance of $\pm 15$ seconds is negligible for proving existence at a macroscopic calendar date, month, and year, while providing immutability that cannot be backdated or forward-dated retroactively.

---

## 5. End-to-End Verification Lifecycle

```
[ Step 1: Ingestion ]       User drags file into dApp browser interface.
          |
[ Step 2: Hashing ]         Client computes SHA-256 in milliseconds. Document stays local.
          |
[ Step 3: Registration ]    User executes registerProof(hash) via Web3 wallet (MetaMask, etc.).
          |
[ Step 4: Consensus ]       BOT Chain validates transaction into block N.
          |
[ Step 5: Verification ]    Third party enters hash or uploads document to Audit Portal.
          |
[ Step 6: Attestation ]     dApp compares computed hash with on-chain genesis record:
                            - Match: Verified Authentic + Genesis Block Height + Timestamp.
                            - Mismatch: Tampered / Unregistered.
          |
[ Step 7: Receipt ]         Client exports verifiable JSON Proof Receipt & Certificate.
```

### 5.1 Certified Proof Receipt Standard
ProofStamp defines a portable, verifiable JSON proof receipt specification (`ProofReceipt` v1.0) allowing offline and programmatic third-party verification:

```json
{
  "$schema": "https://proofstamp.app/schemas/v1/receipt.json",
  "protocol": "ProofStamp",
  "version": "1.0",
  "network": {
    "name": "BOT Chain Mainnet",
    "chainId": 677,
    "rpc": "https://rpc.botchain.ai"
  },
  "contract": "0x67b3a74bc54158c6b45a60e58bfe195f44d197e3",
  "proof": {
    "id": 42,
    "documentHash": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "creator": "0x1234567890abcdef1234567890abcdef12345678",
    "timestamp": 1793789688,
    "isoTimestamp": "2026-11-04T10:54:48.000Z",
    "blockNumber": 29583277,
    "transactionHash": "0xbbed76450dcc1437a4f149e019131d545d028736cfccd6ac57c8ecf1fb91e82e",
    "revoked": false
  },
  "verification": {
    "explorerUrl": "https://scan.botchain.ai/tx/0xbbed76450dcc1437a4f149e019131d545d028736cfccd6ac57c8ecf1fb91e82e",
    "verifyUrl": "https://proofstamp.app/?hash=0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

---

## 6. Threat Model & Security Analysis

### 6.1 Attack Vectors & Mitigations

#### 1. Document Extraction Attack
- **Threat:** An adversary inspecting on-chain storage or mempool attempts to reconstruct the confidential document.
- **Mitigation:** The pre-image resistance of SHA-256 ensures zero document leakage. With $2^{256}$ states, deriving the original file from the hash is computationally impossible under known physical laws.

#### 2. False Claim Prioritization (Front-Running)
- **Threat:** An attacker intercepts an author's registration transaction in the mempool and attempts to register the identical hash with higher gas priority.
- **Mitigation:** The `ProofStampRegistry` registers each claim as an independent record within `hashToProofIds`. While an attacker could theoretically attempt front-running in an adversarial public mempool, BOT Chain's deterministic block inclusion and rapid confirmation drastically narrow the latency window. Furthermore, ProofStamp recommends signing a combined hash payload containing the author's public key for sensitive IP disclosures.

#### 3. Post-Hoc Record Alteration
- **Threat:** A bad actor attempts to modify an on-chain timestamp or falsify a verification status.
- **Mitigation:** Once included in a finalized BOT Chain block, transaction history and contract state are guarded by consensus proofs. ProofStamp contracts contain no self-destruct (`SELFDESTRUCT`), upgradeable proxy backdoors, or admin override keys.

#### 4. Revocation Tampering
- **Threat:** An unauthorized entity attempts to revoke another user's proof.
- **Mitigation:** Strict EVM equality check: `if (proof.creator != msg.sender) revert NotCreator();`. Revocations cannot be executed by proxy or third parties.

---

## 7. Real-World Applications

1. **Intellectual Property & Prior Art:** Creators, researchers, and inventors timestamp research drafts, trade secrets, and whitepapers to establish undeniable prior art in patent and copyright disputes without public disclosure.
2. **Corporate Governance & Auditing:** Board minutes, financial disclosures, and regulatory compliance logs stamped at creation prevent retroactive balance-sheet or governance tampering.
3. **Legal Contracts & Multi-Party Signatures:** Multiple contracting parties stamp an agreed contract PDF independently, establishing a multi-signature chronological record of mutual consent.
4. **Academic Credentials & Certifications:** Universities and certification bodies anchor hashes of student diplomas; prospective employers verify authenticity instantly without paying database intermediaries.
5. **Software Supply Chain & Binary Security:** Developers publish on-chain hashes for releases and binaries, enabling users to verify that downloaded installers have not been infected with malware or modified in transit.

---

## 8. Protocol Roadmap

```
  Phase 1 (Current)          Phase 2                   Phase 3                   Phase 4
+-------------------+      +-------------------+      +-------------------+      +-------------------+
| Core Protocol     | ---> | Scalability &     | ---> | Zero-Knowledge    | ---> | Identity &        |
| - Registry v1     |      | Batching          |      | Attestations      |      | Standards         |
| - BOT Chain Test  |      | - Merkle Tree API |      | - zk-SNARK proof  |      | - W3C DID / VC    |
| - Web3 dApp       |      | - Gas batching    |      |   of traits       |      | - Enterprise SDK  |
| - Vault & Audit   |      | - Mobile PWA      |      | - Selective leak  |      | - Multi-Chain EVM |
+-------------------+      +-------------------+      +-------------------+      +-------------------+
```

### Phase 1: Core Registry & Web3 Experience (Complete)
- [x] Deployment of `ProofStampRegistry.sol` on BOT Chain Mainnet (Chain ID: 677).
- [x] Client-side SHA-256 Web Crypto engine.
- [x] Multi-claim chronological registry & non-destructive revocation.
- [x] Interactive audit portal with deep-linking (`?hash=0x...`).
- [x] Certified Proof Receipt generation.

### Phase 2: High-Throughput Merkle Batching
- Off-chain cryptographic Merkle tree aggregation for enterprise users stamping millions of documents per day in a single on-chain root registration transaction.
- Open-source Node.js and Python SDKs.

### Phase 3: Zero-Knowledge Attestations (zk-PoE)
- Integration of zk-SNARKs enabling users to prove specific document attributes (e.g., "Contract was signed by an accredited entity" or "File size exceeds threshold") without revealing even the document hash.

### Phase 4: Decentralized Identity (DID) & W3C Standards
- Native integration with W3C Verifiable Credentials and decentralized identifiers (DIDs), creating a global decentralized notarization standard.

---

## 9. Conclusion

ProofStamp establishes a new benchmark for trustless, zero-leakage document verification. By eliminating centralized intermediaries and leveraging BOT Chain’s high-performance consensus, the protocol democratizes mathematical proof of existence. Anyone, anywhere, with an internet browser and an EVM wallet can now secure immutable cryptographic evidence of their intellectual creations and commercial agreements—permanently, privately, and sovereignly.

---

## 10. References & Specifications

1. **NIST FIPS 180-4:** Secure Hash Standard (SHS) — SHA-256 Specifications.
2. **RFC 3161:** Internet X.509 Public Key Infrastructure Time-Stamp Protocol (TSP).
3. **W3C Recommendation:** Web Cryptography API (`SubtleCrypto`).
4. **Ethereum Improvement Proposal (EIP):** EVM Architecture & Solidity v0.8.20 Specifications.
5. **BOT Chain Technical Documentation:** BOT Chain Consensus & EVM Specifications (Chain ID: 677, `https://scan.botchain.ai`).


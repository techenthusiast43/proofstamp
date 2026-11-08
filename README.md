# ProofStamp — Decentralized Document Verification on BOT Chain

**ProofStamp** is a decentralized document verification application (dApp) built for **BOT Chain Mainnet** (Chain ID: `677`). It establishes an immutable, publicly verifiable record proving that a specific version of a document existed at a certain point in time.

> 📖 **Read the Official Whitepaper**: [WHITEPAPER.md](WHITEPAPER.md) for full cryptographic proofs, smart contract architecture, security threat models, and roadmap.

---

## 🔒 Core Cryptographic Principle: Zero-Leakage Verification

ProofStamp never uploads your documents to the blockchain or any server.

1. **Client-Side SHA-256**: Your browser generates a 64-character (32-byte) digital fingerprint directly on your device using the native Web Crypto API (`crypto.subtle.digest`).
2. **On-Chain Timestamping**: Only the document's SHA-256 hash, your wallet address, and the block timestamp are recorded in the `ProofStampRegistry` smart contract.
3. **Multi-Registration Support**: Multiple parties can register independent timestamp claims for the same document hash, preserving the genesis timestamp while recording subsequent claims.

---

## 🌐 BOT Chain Mainnet Parameters

| Parameter | Value |
| :--- | :--- |
| **Network Name** | BOT Chain Mainnet |
| **Chain ID** | `677` (`0x2a5`) |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Native Currency** | `BOT` (18 Decimals) |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Total Supply** | 150 Million BOT |
| **Deployed Contract** | [`0x67b3a74bc54158c6b45a60e58bfe195f44d197e3`](https://scan.botchain.ai/address/0x67b3a74bc54158c6b45a60e58bfe195f44d197e3) |

---

## 🚀 Key Features

* **Instant Document Hashing**: Drag & drop any file (PDF, DOCX, image, code, contracts) to compute its SHA-256 fingerprint in milliseconds.
* **Smart Contract Notarization**: One-click registration on BOT Chain via MetaMask / Reown AppKit.
* **Integrity Audit Portal**:
  * Drop a file or enter a hash to verify authenticity.
  * Shows **Verified / Authentic** with genesis timestamp & block height, or **Tampered / Not Found** if the file was modified by even 1 byte.
  * Displays multi-party registration history timeline.
* **My Document Vault**: Browse all documents stamped by your wallet, view transaction links, copy shareable verification URLs (`?hash=0x...`), and revoke records if needed.
* **Downloadable Proof Receipts**: Export a certified JSON receipt or print a high-resolution Proof of Existence certificate.
* **1-Click Contract Deployment**: Built-in contract deployment utility to deploy a fresh instance of `ProofStampRegistry.sol` directly from your browser.

---

## 🛠️ Smart Contract (`ProofStampRegistry.sol`)

The Solidity contract is located at [`contracts/ProofStampRegistry.sol`](contracts/ProofStampRegistry.sol):

* `registerProof(bytes32 documentHash)`: Registers a document hash and emits `ProofRegistered`.
* `verifyProof(bytes32 documentHash)`: Returns verification status, total claims, and genesis record.
* `getProofsByHash(bytes32 documentHash)`: Returns all claims registered for a document.
* `getMyProofs(address user)`: Returns all records created by a wallet address.
* `revokeProof(uint256 id)`: Allows the creator to revoke their claim without altering on-chain history.

### Compile Contract:
```bash
node scripts/compile.cjs
```

### Deploy Contract from CLI:
```bash
PRIVATE_KEY=0x... node scripts/deploy.cjs
```
*(Or use the 1-Click Deployer button directly in the dApp header settings modal).*

---

## 💻 Running the dApp Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Build for production
npm run build
```

The dApp will be accessible at `http://127.0.0.1:5173/`.

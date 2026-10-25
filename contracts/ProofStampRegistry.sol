// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofStampRegistry
 * @dev Document verification registry on BOT Chain (Chain ID: 968).
 * Stores cryptographic document fingerprints (SHA-256) on-chain to provide
 * public, immutable proof-of-existence at a verified point in time.
 * Supports multiple registrations of the same document hash to allow multiple
 * parties to establish independent timestamp claims.
 */
contract ProofStampRegistry {
    // --- Data Structures ---

    struct Proof {
        uint256 id;             // Unique sequential record identifier
        bytes32 documentHash;   // SHA-256 hash of the document bytes
        address creator;        // Wallet address that registered the proof
        uint256 timestamp;      // block.timestamp when registered
        uint256 blockNumber;    // block.number when registered
        bool revoked;           // Whether the creator revoked this claim
    }

    // --- State Variables ---

    uint256 public nextProofId = 1;

    // Mapping from record ID to Proof details
    mapping(uint256 => Proof) public proofs;

    // Mapping from document hash to array of record IDs (supports multiple claims)
    mapping(bytes32 => uint256[]) private hashToProofIds;

    // Mapping from creator address to their registered record IDs
    mapping(address => uint256[]) private userProofIds;

    // --- Events ---

    event ProofRegistered(
        uint256 indexed id,
        bytes32 indexed documentHash,
        address indexed creator,
        uint256 timestamp,
        uint256 blockNumber
    );

    event ProofRevoked(
        uint256 indexed id,
        bytes32 indexed documentHash,
        address indexed creator,
        uint256 timestamp
    );

    // --- Custom Errors ---
    error InvalidHash();
    error ProofNotFound();
    error NotCreator();
    error AlreadyRevoked();

    // --- External / Public Functions ---

    /**
     * @notice Register a document fingerprint (SHA-256 hash) on BOT Chain.
     * @dev Allows multiple users or the same user to register timestamps for the same hash.
     * @param documentHash The bytes32 SHA-256 digest of the document.
     * @return id The unique ID generated for this proof record.
     */
    function registerProof(bytes32 documentHash) external returns (uint256 id) {
        if (documentHash == bytes32(0)) revert InvalidHash();

        id = nextProofId++;

        Proof memory newProof = Proof({
            id: id,
            documentHash: documentHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            revoked: false
        });

        proofs[id] = newProof;
        hashToProofIds[documentHash].push(id);
        userProofIds[msg.sender].push(id);

        emit ProofRegistered(id, documentHash, msg.sender, block.timestamp, block.number);
    }

    /**
     * @notice Revoke a specific proof record. Only the original creator can revoke it.
     * @param id The record ID to revoke.
     */
    function revokeProof(uint256 id) external {
        if (id == 0 || id >= nextProofId) revert ProofNotFound();
        Proof storage proof = proofs[id];
        if (proof.creator != msg.sender) revert NotCreator();
        if (proof.revoked) revert AlreadyRevoked();

        proof.revoked = true;

        emit ProofRevoked(id, proof.documentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieve a proof record by its unique ID.
     * @param id The record ID.
     */
    function getProof(uint256 id) external view returns (Proof memory) {
        if (id == 0 || id >= nextProofId) revert ProofNotFound();
        return proofs[id];
    }

    /**
     * @notice Get all proof records associated with a specific document hash.
     * @dev The first element is the genesis (earliest) timestamp record.
     * @param documentHash The document SHA-256 hash.
     */
    function getProofsByHash(bytes32 documentHash) external view returns (Proof[] memory) {
        uint256[] memory ids = hashToProofIds[documentHash];
        uint256 total = ids.length;
        Proof[] memory results = new Proof[](total);

        for (uint256 i = 0; i < total; i++) {
            results[i] = proofs[ids[i]];
        }
        return results;
    }

    /**
     * @notice Check whether a document hash is registered on-chain and retrieve summary information.
     * @param documentHash The document SHA-256 hash.
     * @return exists True if at least one proof exists.
     * @return totalClaims Number of times this document has been stamped.
     * @return earliestProof The original / earliest proof record (Genesis record).
     */
    function verifyProof(bytes32 documentHash)
        external
        view
        returns (
            bool exists,
            uint256 totalClaims,
            Proof memory earliestProof
        )
    {
        uint256[] memory ids = hashToProofIds[documentHash];
        if (ids.length == 0) {
            return (false, 0, Proof(0, bytes32(0), address(0), 0, 0, false));
        }

        return (true, ids.length, proofs[ids[0]]);
    }

    /**
     * @notice Get all proof records registered by a specific user wallet address.
     * @param user The address of the creator.
     */
    function getMyProofs(address user) external view returns (Proof[] memory) {
        uint256[] memory ids = userProofIds[user];
        uint256 total = ids.length;
        Proof[] memory results = new Proof[](total);

        for (uint256 i = 0; i < total; i++) {
            results[i] = proofs[ids[i]];
        }
        return results;
    }

    /**
     * @notice Get total number of registered proofs on the platform.
     */
    function getTotalProofsCount() external view returns (uint256) {
        return nextProofId - 1;
    }
}

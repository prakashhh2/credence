// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title CredenceCertificateV2
 * @dev Production-ready certificate registry storing SHA-256 hashes (bytes32) on-chain.
 * Uses OpenZeppelin AccessControl for role management (admin + issuer).
 * Only authorized issuer wallets can call `issueCertificate`.
 * Full certificate files are stored off-chain (IPFS/S3) referenced by `ipfsHash`.
 */
contract CredenceCertificateV2 is AccessControl {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        address issuer;
        uint64 issuedAt;
        string ipfsHash; // optional
        bool revoked;
        address claimedBy;
        uint64 claimedAt;
        string metadataURI; // optional JSON metadata link
    }

    // certHash (SHA-256) => Certificate
    mapping(bytes32 => Certificate) private certificates;
    EnumerableSet.Bytes32Set private issuedHashes;

    event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt, string ipfsHash, string metadataURI);
    event CertificateRevoked(bytes32 indexed certHash, address indexed revokedBy, uint64 revokedAt);
    event CertificateClaimed(bytes32 indexed certHash, address indexed claimer, uint64 claimedAt);

    constructor(address admin) {
        require(admin != address(0), "admin required");
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    modifier mustExist(bytes32 certHash) {
        require(certificates[certHash].issuedAt != 0, "certificate not found");
        _;
    }

    /**
     * @notice Issue a certificate. Only accounts with ISSUER_ROLE may call.
     * @param certHash SHA-256 of the certificate file (bytes32)
     * @param ipfsHash Optional IPFS CID or URL for the full certificate file
     * @param metadataURI Optional metadata JSON URI
     */
    function issueCertificate(bytes32 certHash, string calldata ipfsHash, string calldata metadataURI) external onlyRole(ISSUER_ROLE) {
        require(certHash != bytes32(0), "invalid hash");
        require(certificates[certHash].issuedAt == 0, "already issued");

        certificates[certHash] = Certificate({
            issuer: msg.sender,
            issuedAt: uint64(block.timestamp),
            ipfsHash: ipfsHash,
            revoked: false,
            metadataURI: metadataURI
        });

        issuedHashes.add(certHash);

        emit CertificateIssued(certHash, msg.sender, uint64(block.timestamp), ipfsHash, metadataURI);
    }

    /**
     * @notice Claim a certificate as a student. A certificate can be claimed only once.
     */
    function claimCertificate(bytes32 certHash) external mustExist(certHash) {
        Certificate storage cert = certificates[certHash];
        require(cert.claimedBy == address(0), "already claimed");
        require(!cert.revoked, "revoked certificate");
        cert.claimedBy = msg.sender;
        cert.claimedAt = uint64(block.timestamp);
        emit CertificateClaimed(certHash, msg.sender, cert.claimedAt);
    }

    /**
     * @notice Revoke a certificate. Only DEFAULT_ADMIN_ROLE can revoke.
     */
    function revokeCertificate(bytes32 certHash) external onlyRole(DEFAULT_ADMIN_ROLE) mustExist(certHash) {
        Certificate storage cert = certificates[certHash];
        require(!cert.revoked, "already revoked");
        cert.revoked = true;
        emit CertificateRevoked(certHash, msg.sender, uint64(block.timestamp));
    }

    /**
     * @notice Returns certificate details for `certHash`.
     */
    function getCertificate(bytes32 certHash) external view mustExist(certHash) returns (address issuer, uint64 issuedAt, string memory ipfsHash, bool revoked, address claimedBy, uint64 claimedAt, string memory metadataURI) {
        Certificate storage c = certificates[certHash];
        return (c.issuer, c.issuedAt, c.ipfsHash, c.revoked, c.claimedBy, c.claimedAt, c.metadataURI);
    }

    function exists(bytes32 certHash) external view returns (bool) {
        return certificates[certHash].issuedAt != 0;
    }

    function isIssuer(address account) external view returns (bool) {
        return hasRole(ISSUER_ROLE, account);
    }

    /**
     * @notice Grant or revoke issuer role. Only admin may call.
     */
    function grantIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, account);
    }

    function revokeIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, account);
    }

    /**
     * @notice Paginated list of issued certificate hashes. Keep small ranges to avoid gas/size issues.
     */
    function listIssued(uint256 start, uint256 count) external view returns (bytes32[] memory out) {
        uint256 size = issuedHashes.length();
        if (start >= size) return new bytes32[](0);
        uint256 end = start + count;
        if (end > size) end = size;
        uint256 len = end - start;
        out = new bytes32[](len);
        for (uint256 i = 0; i < len; i++) {
            out[i] = issuedHashes.at(start + i);
        }
    }
}

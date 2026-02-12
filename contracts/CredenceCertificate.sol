// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CredenceCertificate
 * @dev Smart contract for storing and verifying blockchain-backed certificates
 * Deployed on: Polygon (Mumbai Testnet) / Ethereum (Sepolia Testnet)
 */

contract CredenceCertificate {
    // Certificate structure
    struct Certificate {
        string studentName;
        string degree;
        string issueDate;
        string universityName;
        string ipfsHash; // IPFS hash of the certificate file
        string certificateHash; // SHA256 hash of certificate
        address issuedBy; // University/Issuer address
        address claimedBy; // Student who claimed it
        uint256 issuedAt; // Timestamp
        uint256 claimedAt; // When student claimed it
        bool revoked; // If certificate is revoked
        string metadataURI; // URI to additional metadata
    }

    // Mappings
    mapping(string => Certificate) public certificates; // certificateHash => Certificate
    mapping(address => string[]) public studentCertificates; // student address => array of certificate hashes
    mapping(address => bool) public authorizedIssuers; // authorized universities

    // Events
    event CertificateIssued(
        string indexed certificateHash,
        string studentName,
        string degree,
        address indexed issuer,
        uint256 issuedAt
    );

    event CertificateClaimed(
        string indexed certificateHash,
        address indexed student,
        uint256 claimedAt
    );

    event CertificateRevoked(
        string indexed certificateHash,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event IssuerAuthorized(address indexed issuer, uint256 authorizedAt);
    event IssuerRemoved(address indexed issuer, uint256 removedAt);

    // Owner of contract (for managing authorized issuers)
    address public owner;

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    /**
     * @dev Issue a new certificate
     * @param _studentName Name of student
     * @param _degree Degree/certification
     * @param _issueDate Issue date
     * @param _universityName Name of issuing university
     * @param _ipfsHash IPFS hash of certificate file
     * @param _certificateHash SHA256 hash of certificate
     * @param _metadataURI URI to additional metadata
     */
    function issueCertificate(
        string memory _studentName,
        string memory _degree,
        string memory _issueDate,
        string memory _universityName,
        string memory _ipfsHash,
        string memory _certificateHash,
        string memory _metadataURI
    ) public onlyAuthorized returns (string memory) {
        // Check certificate doesn't already exist
        require(
            certificates[_certificateHash].issuedAt == 0,
            "Certificate already exists"
        );

        // Create certificate
        certificates[_certificateHash] = Certificate({
            studentName: _studentName,
            degree: _degree,
            issueDate: _issueDate,
            universityName: _universityName,
            ipfsHash: _ipfsHash,
            certificateHash: _certificateHash,
            issuedBy: msg.sender,
            claimedBy: address(0),
            issuedAt: block.timestamp,
            claimedAt: 0,
            revoked: false,
            metadataURI: _metadataURI
        });

        emit CertificateIssued(
            _certificateHash,
            _studentName,
            _degree,
            msg.sender,
            block.timestamp
        );

        return _certificateHash;
    }

    /**
     * @dev Student claims their certificate
     * @param _certificateHash Hash of certificate to claim
     */
    function claimCertificate(string memory _certificateHash) public {
        Certificate storage cert = certificates[_certificateHash];

        require(cert.issuedAt != 0, "Certificate not found");
        require(cert.claimedBy == address(0), "Already claimed");
        require(!cert.revoked, "Certificate is revoked");

        cert.claimedBy = msg.sender;
        cert.claimedAt = block.timestamp;

        studentCertificates[msg.sender].push(_certificateHash);

        emit CertificateClaimed(_certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a certificate exists and is valid
     * @param _certificateHash Hash to verify
     */
    function verifyCertificate(string memory _certificateHash)
        public
        view
        returns (
            bool exists,
            bool isClaimed,
            bool isRevoked,
            string memory studentName,
            string memory degree
        )
    {
        Certificate storage cert = certificates[_certificateHash];

        if (cert.issuedAt == 0) {
            return (false, false, false, "", "");
        }

        return (
            true,
            cert.claimedBy != address(0),
            cert.revoked,
            cert.studentName,
            cert.degree
        );
    }

    /**
     * @dev Get full certificate details
     * @param _certificateHash Hash of certificate
     */
    function getCertificateDetails(string memory _certificateHash)
        public
        view
        returns (Certificate memory)
    {
        require(certificates[_certificateHash].issuedAt != 0, "Not found");
        return certificates[_certificateHash];
    }

    /**
     * @dev Get all certificates for a student
     * @param _student Student address
     */
    function getStudentCertificates(address _student)
        public
        view
        returns (string[] memory)
    {
        return studentCertificates[_student];
    }

    /**
     * @dev Revoke a certificate
     * @param _certificateHash Certificate to revoke
     */
    function revokeCertificate(string memory _certificateHash)
        public
        onlyAuthorized
    {
        Certificate storage cert = certificates[_certificateHash];
        require(cert.issuedAt != 0, "Certificate not found");
        require(msg.sender == cert.issuedBy, "Only issuer can revoke");
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;

        emit CertificateRevoked(_certificateHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Authorize a new issuer (university)
     * @param _issuer Address of issuer
     */
    function authorizeIssuer(address _issuer) public onlyOwner {
        require(!authorizedIssuers[_issuer], "Already authorized");
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer, block.timestamp);
    }

    /**
     * @dev Remove authorized issuer
     * @param _issuer Address to remove
     */
    function removeIssuer(address _issuer) public onlyOwner {
        require(authorizedIssuers[_issuer], "Not authorized");
        authorizedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer, block.timestamp);
    }

    /**
     * @dev Transfer contract ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}

use anchor_lang::prelude::*;


#[account]
pub struct CertificateAccount {
    /// SHA-256 hex digest of the certificate payload (64 hex chars)
    pub certificate_hash: String,
    /// Full name of the student
    pub student_name: String,
    /// Student date of birth 
    pub date_of_birth: String,
    /// Issuing university / institution name
    pub university_name: String,
    /// Year the student passed out / graduated
    pub passout_year: u32,
    /// Field / major of study
    pub field_of_study: String,
    /// GPA or CGPA string (e.g. "3.85")
    pub gpa: String,
    /// Full degree or certificate title
    pub degree_title: String,
    /// Student ID issued by the university
    pub student_id: String,
    /// Certificate issue date (YYYY-MM-DD)
    pub issue_date: String,
    /// Pinata / IPFS CID of the certificate document
    pub ipfs_cid: String,
    /// Wallet of the university admin that issued the certificate
    pub issuer: Pubkey,
    /// Unix timestamp (seconds) of when the cert was recorded on-chain
    pub issued_at: i64,
    /// Revocation flag — once true the certificate is considered invalid
    pub revoked: bool,
}

impl CertificateAccount {
    
    pub const SPACE: usize = 8
        + (4 + 64)
        + (4 + 100)
        + (4 + 10)
        + (4 + 150)
        + 4
        + (4 + 100)
        + (4 + 20)
        + (4 + 150)
        + (4 + 50)
        + (4 + 10)
        + (4 + 60)
        + 32
        + 8
        + 1;
}

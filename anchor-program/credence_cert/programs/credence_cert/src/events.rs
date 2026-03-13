use anchor_lang::prelude::*;

#[event]
pub struct CertificateIssued {
    pub issuer: Pubkey,
    pub certificate: Pubkey,
    pub student_name: String,
    pub certificate_hash: String,
    pub timestamp: i64,
}

#[event]
pub struct CertificateVerified {
    pub certificate: Pubkey,
    pub verified: bool,
    pub timestamp: i64,
}

#[event]
pub struct CertificateRevoked {
    pub certificate: Pubkey,
    pub issuer: Pubkey,
    pub timestamp: i64,
}

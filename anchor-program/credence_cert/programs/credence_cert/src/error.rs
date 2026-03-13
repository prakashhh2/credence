use anchor_lang::prelude::*;

#[error_code]
pub enum CertError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    
    #[msg("Certificate has been revoked")]
    CertificateRevoked,
    
    #[msg("Invalid certificate data")]
    InvalidData,
    
    #[msg("Certificate data too large")]
    DataTooLarge,
}

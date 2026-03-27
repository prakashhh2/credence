use anchor_lang::prelude::*;

#[error_code]
pub enum CredenceError {
    #[msg("Certificate hash must be exactly 64 characters (SHA-256 hex).")]
    InvalidHashLength,
    #[msg("Only the original issuer can revoke this certificate.")]
    UnauthorizedRevocation,
    #[msg("Certificate is already revoked.")]
    AlreadyRevoked,
    #[msg("Student name cannot be empty.")]
    EmptyStudentName,
    #[msg("University name cannot be empty.")]
    EmptyUniversityName,
    #[msg("Passout year is invalid.")]
    InvalidPassoutYear,
}

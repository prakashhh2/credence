use anchor_lang::prelude::*;
use crate::state::Certificate;
use crate::error::CertError;
use crate::events::CertificateVerified;

#[derive(Accounts)]
pub struct VerifyCertificate<'info> {
    pub certificate: Account<'info, Certificate>,
}

pub fn verify_certificate(ctx: Context<VerifyCertificate>) -> Result<bool> {
    let cert = &ctx.accounts.certificate;
    
    require!(!cert.revoked, CertError::CertificateRevoked);
    
    let is_valid = !cert.revoked;

    emit!(CertificateVerified {
        certificate: cert.key(),
        verified: is_valid,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(is_valid)
}

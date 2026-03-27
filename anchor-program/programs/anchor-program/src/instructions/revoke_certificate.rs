use anchor_lang::prelude::*;
use crate::state::CertificateAccount;
use crate::constants::CERTIFICATE_SEED;
use crate::error::CredenceError;

#[derive(Accounts)]
pub struct RevokeCertificate<'info> {
    /// The certificate PDA to revoke.
    #[account(
        mut,
        seeds = [CERTIFICATE_SEED, &certificate.certificate_hash.as_bytes()[..32]],
        bump,
        has_one = issuer @ CredenceError::UnauthorizedRevocation,
    )]
    pub certificate: Account<'info, CertificateAccount>,

    /// Must be the original issuer.
    pub issuer: Signer<'info>,
}

pub fn handler(ctx: Context<RevokeCertificate>) -> Result<()> {
    let cert = &mut ctx.accounts.certificate;
    require!(!cert.revoked, CredenceError::AlreadyRevoked);
    cert.revoked = true;
    msg!("Certificate revoked. Hash: {}", cert.certificate_hash);
    Ok(())
}

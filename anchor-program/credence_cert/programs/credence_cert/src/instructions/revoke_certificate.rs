use anchor_lang::prelude::*;
use crate::state::Certificate;
use crate::error::CertError;
use crate::events::CertificateRevoked;

#[derive(Accounts)]
pub struct RevokeCertificate<'info> {
    #[account(mut)]
    pub certificate: Account<'info, Certificate>,

    pub issuer: Signer<'info>,
}

pub fn revoke_certificate(ctx: Context<RevokeCertificate>) -> Result<()> {
    let cert = &mut ctx.accounts.certificate;

    require_eq!(ctx.accounts.issuer.key(), cert.issuer, CertError::Unauthorized);

    cert.revoked = true;

    emit!(CertificateRevoked {
        certificate: cert.key(),
        issuer: cert.issuer,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

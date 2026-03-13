use anchor_lang::prelude::*;
use crate::state::Certificate;
use crate::events::CertificateIssued;

#[derive(Accounts)]
#[instruction(
    student_name: String,
    student_id: String,
    degree_title: String,
    university_name: String,
    issue_date: String,
    certificate_hash: String,
    ipfs_cid: Option<String>,
)]
pub struct IssueCertificate<'info> {
    #[account(
        init,
        payer = issuer,
        space = Certificate::SIZE,
        seeds = [
            b"certificate",
            certificate_hash.as_bytes(),
        ],
        bump
    )]
    pub certificate: Account<'info, Certificate>,

    #[account(mut)]
    pub issuer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn issue_certificate(
    ctx: Context<IssueCertificate>,
    student_name: String,
    student_id: String,
    degree_title: String,
    university_name: String,
    issue_date: String,
    certificate_hash: String,
    ipfs_cid: Option<String>,
) -> Result<()> {
    let cert = &mut ctx.accounts.certificate;
    
    cert.issuer = ctx.accounts.issuer.key();
    cert.student_name = student_name.clone();
    cert.student_id = student_id;
    cert.degree_title = degree_title;
    cert.university_name = university_name;
    cert.issue_date = issue_date;
    cert.certificate_hash = certificate_hash.clone();
    cert.ipfs_cid = ipfs_cid;
    cert.issued_at = Clock::get()?.unix_timestamp;
    cert.revoked = false;
    cert.bump = ctx.bumps.certificate;

    emit!(CertificateIssued {
        issuer: ctx.accounts.issuer.key(),
        certificate: cert.key(),
        student_name,
        certificate_hash,
        timestamp: cert.issued_at,
    });

    Ok(())
}

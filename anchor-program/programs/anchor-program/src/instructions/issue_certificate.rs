use anchor_lang::prelude::*;
use crate::state::CertificateAccount;
use crate::constants::CERTIFICATE_SEED;
use crate::error::CredenceError;

#[derive(Accounts)]
#[instruction(certificate_hash: String)]
pub struct IssueCertificate<'info> {
    /// The certificate PDA — created here, keyed by the certificate hash.
    #[account(
        init,
        payer = issuer,
        space = CertificateAccount::SPACE,
        seeds = [CERTIFICATE_SEED, &certificate_hash.as_bytes()[..32]],
        bump,
    )]
    pub certificate: Account<'info, CertificateAccount>,

    /// The university admin wallet that pays for the account and signs the TX.
    #[account(mut)]
    pub issuer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<IssueCertificate>,
    certificate_hash: String,
    student_name: String,
    date_of_birth: String,
    university_name: String,
    passout_year: u32,
    field_of_study: String,
    gpa: String,
    degree_title: String,
    student_id: String,
    issue_date: String,
    ipfs_cid: String,
) -> Result<()> {
    // Validate inputs
    require!(certificate_hash.len() == 64, CredenceError::InvalidHashLength);
    require!(!student_name.trim().is_empty(), CredenceError::EmptyStudentName);
    require!(!university_name.trim().is_empty(), CredenceError::EmptyUniversityName);
    require!(passout_year >= 1900 && passout_year <= 2100, CredenceError::InvalidPassoutYear);

    let cert = &mut ctx.accounts.certificate;
    cert.certificate_hash = certificate_hash;
    cert.student_name = student_name;
    cert.date_of_birth = date_of_birth;
    cert.university_name = university_name;
    cert.passout_year = passout_year;
    cert.field_of_study = field_of_study;
    cert.gpa = gpa;
    cert.degree_title = degree_title;
    cert.student_id = student_id;
    cert.issue_date = issue_date;
    cert.ipfs_cid = ipfs_cid;
    cert.issuer = ctx.accounts.issuer.key();
    cert.issued_at = Clock::get()?.unix_timestamp;
    cert.revoked = false;

    msg!(
        "Certificate issued on-chain. Hash: {}, Student: {}, University: {}",
        cert.certificate_hash,
        cert.student_name,
        cert.university_name
    );

    Ok(())
}

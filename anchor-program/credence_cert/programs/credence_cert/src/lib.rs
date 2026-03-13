use anchor_lang::prelude::*;

declare_id!("7HMYW9c9Hb3SoMfME4hucUDrKi5iWwpD4QeSGeLDUfAf");

#[program]
pub mod credence_cert {
    use super::*;

    /// Create a certificate and store it on Solana
    pub fn create_certificate(
        ctx: Context<CreateCertificate>,
        university_name: String,
        student_name: String,
        student_id: String,
        date_of_birth: String,
        ipfs_cid: String,
    ) -> Result<()> {
        let certificate = &mut ctx.accounts.certificate;
        
        certificate.university_name = university_name;
        certificate.student_name = student_name;
        certificate.student_id = student_id;
        certificate.date_of_birth = date_of_birth;
        certificate.ipfs_cid = ipfs_cid;
        certificate.owner = ctx.accounts.user.key();
        certificate.created_at = Clock::get()?.unix_timestamp;

        msg!("✅ Certificate created successfully");
        Ok(())
    }
}

/// Context for creating a certificate
/// Initializes a standard certificate account
#[derive(Accounts)]
pub struct CreateCertificate<'info> {
    #[account(
        init,
        payer = user,
        space = Certificate::MAX_SIZE
    )]
    pub certificate: Account<'info, Certificate>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Certificate account data structure
#[account]
pub struct Certificate {
    pub university_name: String,      // Required: Must contain "University" or "College"
    pub student_name: String,         // Student's full name
    pub student_id: String,           // Unique student identifier
    pub date_of_birth: String,        // Student's date of birth
    pub ipfs_cid: String,             // IPFS CID for the certificate PDF
    pub owner: Pubkey,                // Creator/issuer of the certificate
    pub created_at: i64,              // Unix timestamp when certificate was created
}

impl Certificate {
    /// Maximum size needed for the Certificate account
    /// Calculated as: 8 (discriminator) + field sizes
    const MAX_SIZE: usize = 8 +           // Anchor discriminator
        (4 + 50) +                        // university_name (String: 4 bytes length + max 50 bytes)
        (4 + 50) +                        // student_name (String: 4 bytes length + max 50 bytes)
        (4 + 20) +                        // student_id (String: 4 bytes length + max 20 bytes)
        (4 + 20) +                        // date_of_birth (String: 4 bytes length + max 20 bytes)
        (4 + 46) +                        // ipfs_cid (String: 4 bytes length + max 46 bytes for IPFS hash)
        32 +                              // owner (Pubkey)
        8;                                // created_at (i64 timestamp)
}


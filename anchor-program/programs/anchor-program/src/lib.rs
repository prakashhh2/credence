pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("CWQmifkEM6m8JfMxcc6xCgVhUGtRPEypWA2tATev2KHM");

#[program]
pub mod anchor_program {
    use super::*;

    
    pub fn issue_certificate(
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
        issue_certificate::handler(
            ctx,
            certificate_hash,
            student_name,
            date_of_birth,
            university_name,
            passout_year,
            field_of_study,
            gpa,
            degree_title,
            student_id,
            issue_date,
            ipfs_cid,
        )
    }


    pub fn revoke_certificate(ctx: Context<RevokeCertificate>) -> Result<()> {
        revoke_certificate::handler(ctx)
    }
}

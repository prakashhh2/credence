use anchor_lang::prelude::*;

#[account]
pub struct Certificate {
    pub issuer: Pubkey,
    pub student_name: String,
    pub student_id: String,
    pub degree_title: String,
    pub university_name: String,
    pub issue_date: String,
    pub certificate_hash: String,
    pub ipfs_cid: Option<String>,
    pub issued_at: i64,
    pub revoked: bool,
    pub bump: u8,
}

impl Certificate {
    pub const SIZE: usize = 8  // discriminator
        + 32  // issuer pubkey
        + (4 + 50)  // student_name
        + (4 + 20)  // student_id
        + (4 + 50)  // degree_title
        + (4 + 50)  // university_name
        + (4 + 10)  // issue_date
        + (4 + 64)  // certificate_hash
        + (1 + 4 + 46)  // ipfs_cid (Option<String>)
        + 8  // issued_at
        + 1  // revoked
        + 1;  // bump
}

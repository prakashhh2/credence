const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredenceCertificateV2", function () {
  let Credence, credence, owner, issuer, student;

  beforeEach(async function () {
    [owner, issuer, student] = await ethers.getSigners();
    Credence = await ethers.getContractFactory("CredenceCertificateV2");
    credence = await Credence.deploy(owner.address);
    await credence.deployed();
  });

  it("allows admin to grant issuer role and issuer to issue certificate", async function () {
    // owner should be admin
    expect(await credence.hasRole(await credence.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

    // grant issuer role to issuer
    await credence.connect(owner).grantIssuer(issuer.address);
    expect(await credence.isIssuer(issuer.address)).to.be.true;

    // issuer issues a certificate
    const certHex = '0x' + 'a'.repeat(64);
    await expect(credence.connect(issuer).issueCertificate(certHex, 'ipfs://QmTest', ''))
      .to.emit(credence, 'CertificateIssued');

    expect(await credence.exists(certHex)).to.be.true;
  });

  it("allows student to claim certificate", async function () {
    // setup issuer and issue
    await credence.connect(owner).grantIssuer(issuer.address);
    const certHex = '0x' + 'b'.repeat(64);
    await credence.connect(issuer).issueCertificate(certHex, '', '');

    // student claims
    await expect(credence.connect(student).claimCertificate(certHex))
      .to.emit(credence, 'CertificateClaimed');

    const c = await credence.getCertificate(certHex);
    expect(c[4]).to.equal(student.address); // claimedBy
  });

  it("prevents double claiming and revocation by admin", async function () {
    await credence.connect(owner).grantIssuer(issuer.address);
    const certHex = '0x' + 'c'.repeat(64);
    await credence.connect(issuer).issueCertificate(certHex, '', '');

    await credence.connect(student).claimCertificate(certHex);
    await expect(credence.connect(student).claimCertificate(certHex)).to.be.revertedWith('already claimed');

    // revoke by admin
    await expect(credence.connect(owner).revokeCertificate(certHex)).to.emit(credence, 'CertificateRevoked');
  });
});

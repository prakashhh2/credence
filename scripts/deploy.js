const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const Credence = await hre.ethers.getContractFactory("CredenceCertificateV2");
  const credence = await Credence.deploy(deployer.address);
  await credence.deployed();

  console.log("CredenceCertificateV2 deployed to:", credence.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

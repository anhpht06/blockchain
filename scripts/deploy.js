// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();

  const MintRC20 = await ethers.getContractFactory("MintRC20");
  const mintRC20 = await MintRC20.deploy("TuanAnh", "TA");
  await mintRC20.deployed();

  console.log("Token address:", token.address);
  console.log("MintRC20 address:", mintRC20.address);

  deployMintRC20(mintRC20, token);
}

//deploy MintRC20
function deployMintRC20(mintRC20, token) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(
      { token: token.address, mintRC20: mintRC20.address },
      undefined,
      2
    )
  );

  const contractList = [{ name: "MintRC20" }, { name: "Token" }];

  contractList.forEach((contract) => {
    const artifact = artifacts.readArtifactSync(contract.name);
    fs.writeFileSync(
      path.join(contractsDir, `${contract.name}.json`),
      JSON.stringify(artifact, null, 2)
    );
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

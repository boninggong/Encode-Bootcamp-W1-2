import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}

async function main() {
    const args = process.argv;
    const proposals = args.slice(2);
    if(proposals.length <= 0) {
        throw new Error("Not enough proposal arguments");
    }
    console.log(proposals);

    let ballotContract: Ballot;
    let accounts: SignerWithAddress[];

    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
    await ballotContract.deployed();

    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    
console.log(`Contract deployed at ${ballotContract.address}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
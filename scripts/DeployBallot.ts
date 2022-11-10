import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";

import * as dotenv from 'dotenv'
dotenv.config()

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}

// Deploys the enhanced ballot contract to the Goerli network 
async function main() {
    const provider = ethers.getDefaultProvider("goerli");
    console.log(process.env.PRIVATE_KEY);

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
    console.log(wallet);

    const signer = wallet.connect(provider);
    console.log((await signer.getBalance()).toString());

    const args = process.argv;
    const proposals = args.slice(2);
    if(proposals.length <= 0) {
        throw new Error("Not enough proposal arguments");
    }
    console.log(proposals);

    let ballotContract: Ballot;
    const ballotFactory = new Ballot__factory(signer);
    ballotContract = await ballotFactory.deploy(proposals);
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
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";

import * as dotenv from "dotenv";
dotenv.config();

// List of all callable functions within the ballot contract
const functions = [
  "resetBallot",
  "transferChairPerson",
  "giveRightToVote",
  "delegate",
  "vote",
  "winningProposal",
  "winnerName",
];

// List of all callable functions that require 1 input parameter
const functionsWithOneArgument = [
  "transferChairPerson",
  "giveRightToVote",
  "delegate",
  "vote",
];

async function main() {
  // Setup of network provider and signer
  const provider = ethers.getDefaultProvider("goerli");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  const signer = wallet.connect(provider);

  const args = process.argv;
  const params = args.slice(2);
  // Requires at least 2 arguments
  // 1) Address of the Ballot contract to interact with
  // 2) Function name to call
  // 3) Function input, only if a function that requires an input is called
  if (params.length <= 1) {
    throw new Error("Missing arguments");
  }

  const contractAddress = params[0];
  const functionCalled = params[1];

  // Checks if function is an existing function in the ballot contract
  if (!functions.includes(functionCalled)) {
    throw new Error("Not a valid function called");
  }

  console.log(`Function called: ${functionCalled}()`);

  // Connect to a given live ballot contract address
  let ballotContract: Ballot;
  const ballotFactory = new Ballot__factory(signer);
  ballotContract = await ballotFactory.attach(contractAddress);

  let tx;
  if (functionsWithOneArgument.includes(functionCalled)) {
    // Checks if any function input is passed
    if (params.length <= 2) {
      throw new Error("No function input found");
    }

    let functionInput = params[2];

    // Ensures a string is passed when input is an address
    if (functionInput.substring(0, 2) == "0x") {
      functionInput = JSON.stringify(functionInput);
    }
    console.log(`Function input: ${functionInput}`);

    // Calls function with given input on the ballot contract
    tx = await eval(`ballotContract.${functionCalled}(${functionInput})`);
  } else {
    // Calls given function on the ballot contract
    tx = await eval(`ballotContract.${functionCalled}()`);
  }

  console.log("Output of function");
  console.log({ tx });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

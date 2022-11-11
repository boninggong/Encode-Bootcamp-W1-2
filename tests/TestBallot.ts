import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployContract } from "@nomiclabs/hardhat-ethers/types";
import { expect } from "chai";
import exp from "constants";
import { providers, Signer } from "ethers";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types/Ballot";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

describe("Ballot", () => {
  let ballotContract: Ballot;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
    accounts = await ethers.getSigners();
  });

  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });
  });

  it("has zero votes for all proposals", async function () {
    for (let index = 0; index < PROPOSALS.length; index++) {
      const voteCount = await (await ballotContract.proposals(index)).voteCount;
      expect(voteCount).to.eq(0);
    }
  });

  it("sets the deployer address as chairperson", async function () {
    const chairPerson = await ballotContract.chairperson();
    const deployerAddress = accounts[0].address;
    expect(chairPerson).to.equal(deployerAddress);
  });

  it("sets the voting weight for the chairperson as 1", async function () {
    const chairPersonVoter = await ballotContract.voters(accounts[0].address);
    expect(chairPersonVoter.weight).to.equal(1);
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      await ballotContract.giveRightToVote(accounts[1].address);
      expect(
        (await ballotContract.voters(accounts[1].address)).weight
      ).to.equal(1);
    });
    it("can not give right to vote for someone that has voted", async function () {
      await ballotContract.giveRightToVote(accounts[1].address);
      await ballotContract.connect(accounts[1]).vote(0);
      expect(
        ballotContract.giveRightToVote(accounts[1].address)
      ).to.be.revertedWith("Already voted");
    });
    it("can not give right to vote for someone that has already voting rights", async function () {
      await ballotContract.giveRightToVote(accounts[1].address);
      expect(
        ballotContract.giveRightToVote(accounts[1].address)
      ).to.be.revertedWith("The voter already voted.");
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    it("should register the vote", async () => {
      await ballotContract.vote(0);
      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(1);
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("should transfer voting power", async () => {
      await ballotContract.giveRightToVote(accounts[1].address);
      await ballotContract.delegate(accounts[1].address);
      expect(
        (await ballotContract.voters(accounts[1].address)).weight
      ).to.equal(2);
    });
  });

  describe("when an attacker interacts with the vote function in the contract", function () {
    it("should revert", async () => {
      expect(ballotContract.connect(accounts[2]).vote(0)).to.be.revertedWith(
        "Has no right to vote"
      );
    });
  });

  describe("when an attacker interacts with the giveRightToVote function in the contract", function () {
    it("should revert", async () => {
      expect(
        ballotContract.connect(accounts[2]).giveRightToVote(accounts[3].address)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    it("should revert", async () => {
      expect(
        ballotContract.connect(accounts[2]).delegate(accounts[3].address)
      ).to.be.revertedWith("You have no right to vote");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("should return 0", async () => {
      expect(await ballotContract.winningProposal()).to.equal(0);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("should return name of proposal 0", async () => {
      const proposalName = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(proposalName)).to.equal(
        PROPOSALS[0]
      );
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("should return 0", async () => {
      await ballotContract.vote(0);
      expect(
        await ballotContract.connect(accounts[1]).winningProposal()
      ).to.equal(0);
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    it("should return name of proposal 0", async () => {
      await ballotContract.vote(0);
      const proposalName = await ballotContract
        .connect(accounts[1])
        .winnerName();
      expect(ethers.utils.parseBytes32String(proposalName)).to.equal(
        PROPOSALS[0]
      );
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    it("should return the name of the winner proposal", async () => {
      for (let index = 1; index < 5; index++) {
        await ballotContract.giveRightToVote(accounts[index].address);
        await ballotContract.connect(accounts[index]).vote(1);
      }
      const proposalName = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(proposalName)).to.equal(
        PROPOSALS[1]
      );
    });
  });

  describe("when someone takes over the chairperson role", function () {
    it("should give this persons address as chairperson address", async () => {
      console.log(`Current chair person ${await ballotContract.chairperson()}`);
      const nonExistentFuncSignature = "nonExistentFunction(uint256,uint256)";
      const fakeDemoContract = new ethers.Contract(
        ballotContract.address,
        [
          ...ballotContract.interface.fragments,
          `function ${nonExistentFuncSignature}`,
        ],
        accounts[0]
      );
      const tx = await fakeDemoContract
        .connect(accounts[1])
        [nonExistentFuncSignature](4, 2);
      console.log(`New chair person ${await ballotContract.chairperson()}`);
      expect(await ballotContract.chairperson()).to.equal(accounts[1].address);
    });
  });

  describe("when chairPerson resets the ballot through fullResetOfBallot", function () {
    it("should return proposal 0 as winning proposal", async () => {
      for (let index = 1; index < 5; index++) {
        await ballotContract.giveRightToVote(accounts[index].address);
        await ballotContract.connect(accounts[index]).vote(1);
      }
      await ballotContract.resetBallot();
      const proposalName = await ballotContract.winnerName();
      expect(ethers.utils.parseBytes32String(proposalName)).to.equal(
        PROPOSALS[0]
      );
      expect(
        (await ballotContract.voters(accounts[2].address)).weight
      ).to.equal(0);
    });

    it("should reset the weight of vote of everyone, except chairperson, to 0", async () => {
      for (let index = 1; index < 5; index++) {
        await ballotContract.giveRightToVote(accounts[index].address);
        await ballotContract.connect(accounts[index]).vote(1);
      }
      await ballotContract.resetBallot();
      const proposalName = await ballotContract.winnerName();
      for (let index = 1; index < 5; index++) {
        const voter = await ballotContract.voters(accounts[index].address);
        expect(voter.weight).to.equal(0);
      }
    });

    it("should not allow other addresses to try to reset the contract", async () => {
      expect(ballotContract.connect(accounts[1]).resetBallot()).to.be.reverted;
    });
  });
});

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

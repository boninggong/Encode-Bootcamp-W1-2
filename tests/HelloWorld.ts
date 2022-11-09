import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HelloWorld } from "../typechain-types";

describe("Hello World", async () => {

    let helloWorldContract: HelloWorld;
    let signers: SignerWithAddress[];

    // https://mochajs.org/#hooks
    beforeEach(async function () {
        // https://hardhat.org/plugins/nomiclabs-hardhat-ethers.html#helpers
        const helloWorldFactory = await ethers.getContractFactory("HelloWorld");
        // https://docs.ethers.io/v5/api/contract/contract-factory/#ContractFactory-deploy
        helloWorldContract = await helloWorldFactory.deploy() as HelloWorld;
        // https://docs.ethers.io/v5/api/contract/contract/#Contract-deployed
        await helloWorldContract.deployed();
        signers = await ethers.getSigners();
    });

    it("Should give a Hello World", async () => {
        const text = await helloWorldContract.helloWorld();
        expect(text).to.equal("Hello World");
    })

    it("Should set owner to the deployer account", async () => {
        const owner = await helloWorldContract.owner();
        expect(owner).to.equal(signers[0].address);
    })

    it("Should change text correctly", async function () {
        const tx = await helloWorldContract.setText("New Text");
        await tx.wait(1);
        const newText = await helloWorldContract.helloWorld();
        expect(newText).to.equal("New Text");
      });

    it("Should not allow anyone other than owner to change text", async function () {
        await expect(helloWorldContract.connect(signers[1]).setText("New Text")).to.be.reverted
    });
});
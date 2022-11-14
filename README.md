# Encode homework and project code

This repository contains all my work as part of the [Encode Solidity Bootcamp](https://www.encode.club/solidity-bootcamps), which is a selective 8 week intensive Bootcamp in which Solidity and blockchain programming is taught.

## Week 1

We have implemented our own [HelloWorld smart contract](https://github.com/boninggong/Encode-Projects/blob/main/contracts/1_HelloWorld.sol) that can store text and keep track of ownership. It is inheriting from an interface with functions it needs to implement. We simultaneously use the interface to interact with the deployed contract. Furthermore, we applied a small gimmick of having a backdoor that let people steal ownership when the fallback function is triggered. This ensures that the contract is never stuck with an inactive/invalid owner.

Using remix, we deployed an instance of this HelloWorld contract at [0x9C654Ce195e482c8B1C6C9E0b6922a99b5EE49aE](https://goerli.etherscan.io/address/0x9C654Ce195e482c8B1C6C9E0b6922a99b5EE49aE)

## Week 2

We have implemented our own [Ballot smart contract](https://github.com/boninggong/Encode-Projects/blob/main/contracts/2_Ballot.sol) that can be used to vote on proposals. Additional features we have added include:

- Using string instead of bytes32 for proposal names
- Addition of an array of addresses to keep track of eligible voters
- Usage of a modifier to require only chairperson
- Fallback backdoor to steal chairperson rights (as in our last project)
- Reset ballot function to reset the whole ballot, eg remove votes on proposals and reset each voter rights/weights/votes/delegation except for the chairperson
- Transfer chairperson function

A Typescript script [DeployBallot.ts](https://github.com/boninggong/Encode-Projects/blob/main/scripts/2_DeployBallot.ts) has been developed to deploy this Ballot contract and [CallBallotFunction.ts](https://github.com/boninggong/Encode-Projects/blob/main/scripts/2_CallBallotFunctions.ts) has been developed to interact with a deployed Ballot instance all on the Goerli network. Examples using CallBallotFunction.ts are:

Vote on 3rd proposal:

```typescript
yarn run ts-node scripts/CallBallotFunctions.ts 0x07048F6Fc40C8cf962396e62D3D4dd83dB225a00 vote 2
```

Trigger fallback (and therewith take over chairman status):

```typescript
yarn run ts-node scripts/CallBallotFunctions.ts 0x07048F6Fc40C8cf962396e62D3D4dd83dB225a00 triggerFallback
```

Delegate vote to another address:

```typescript
yarn run ts-node scripts/CallBallotFunctions.ts 0x07048F6Fc40C8cf962396e62D3D4dd83dB225a00 delegate 0x066e7a421Fdd36f2263938aB328D8b2F09d9fCE0
```

An instance of this Ballot contract has been deployed to Goerli at [0x07048F6Fc40C8cf962396e62D3D4dd83dB225a00](https://goerli.etherscan.io/address/0x07048f6fc40c8cf962396e62d3d4dd83db225a00)

## Week 3

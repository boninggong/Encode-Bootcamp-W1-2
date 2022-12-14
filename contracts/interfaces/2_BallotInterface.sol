// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IBallot {
  function resetBallot() external;

  function transferChairPerson(address newChairPerson) external;

  function giveRightToVote(address voter) external;

  function delegate(address to) external;

  function vote(uint256 proposal) external;

  function winningProposal()
    external
    view
    returns (uint256 winningProposalNumber);

  function winnerName()
    external
    view
    returns (string memory winningProposalName);
}

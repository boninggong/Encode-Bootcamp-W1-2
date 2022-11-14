// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IHelloWorld {
  function setText(string calldata newText) external;

  function transferOwnership(address newOwner) external;

  function getOwner() external view returns (address);

  function getText() external view returns (string memory);

  //function randomCall(string calldata text) external returns (address);
}

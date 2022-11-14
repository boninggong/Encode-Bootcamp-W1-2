// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "../contracts/interfaces/1_HelloWorldInterface.sol";

error HelloWorld__NotOwner();

/** @author Group 7
 * @title Hello world contract
 * @dev this contract is a simple contract to get to know how to work with solidity
 */
contract HelloWorld is IHelloWorld {
  /* State variables */
  address private s_owner;
  string private s_text;

  /* Events */
  event ownerChanged(address previousOwner, address newOwner);

  /* Modifiers */
  modifier onlyOwner() {
    if (msg.sender != s_owner) revert HelloWorld__NotOwner();
    _;
  }

  /* Functions */
  constructor() {
    s_text = "Hello World";
    s_owner = msg.sender;
  }

  /**
   * @dev Notice that if you send some ether and the data of the call is not empty,
   *      you'll be the owner of the contract
   */
  fallback() external payable {
    s_owner = msg.sender;
  }

  receive() external payable {}

  function setText(string calldata newText) public override onlyOwner {
    s_text = newText;
  }

  function transferOwnership(address newOwner) public override onlyOwner {
    emit ownerChanged(s_owner, newOwner);
    s_owner = newOwner;
  }

  /* view/pure functions */
  function getText() public view override returns (string memory) {
    return s_text;
  }

  function getOwner() public view override returns (address) {
    return s_owner;
  }
}

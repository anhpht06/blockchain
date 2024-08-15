// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintRC20 is ERC20 {
    address public owner;

    event Mint(address indexed to, uint256 amount);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public {
        // require(msg.sender == owner, "Only the owner can mint tokens");
        _mint(to, amount);
        emit Mint(to, amount); 
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

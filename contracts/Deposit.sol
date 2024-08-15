// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MintERC721 is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("MyNFT", "NFT") Ownable(msg.sender) {}

    function mint(address to) external {
        _safeMint(to, _nextTokenId);
        _nextTokenId++;
    }
}

contract Deposited is Ownable {
    IERC20 public erc20Token;
    MintERC721 public erc721Token;
    mapping(address => uint256) public deposits;
    event Deposit(address indexed user, uint256 amount);
    uint256 public constant DEPOSIT_THRESHOLD = 1000 * 10**18; // Assuming ERC20 has 18 decimals

    constructor(IERC20 _erc20Token, MintERC721 _erc721Token) Ownable(msg.sender) {
        erc20Token = IERC20(_erc20Token);
        erc721Token = MintERC721(_erc721Token);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than 0");

        // Transfer ERC20 tokens from user to this contract
        require(erc20Token.transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");

        // Update user's deposit balance
        deposits[msg.sender] += amount;

        // Check if user's total deposit exceeds the threshold
        if (deposits[msg.sender] >= DEPOSIT_THRESHOLD) {
            // Mint ERC721 token to the user
            erc721Token.mint(msg.sender);
            // deposits[msg.sender] = 0;
            emit Deposit(msg.sender, deposits[msg.sender]);
        }
    }q
}

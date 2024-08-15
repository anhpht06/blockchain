// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.19;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./Deposit.sol";

// contract MintERC721 is ERC721, Ownable {
//     uint256 private _nextTokenId;

//     constructor() ERC721("MyNFT", "NFT") Ownable(msg.sender) {}

//     function mint(address to) external {
//         _safeMint(to, _nextTokenId);
//         _nextTokenId++;
//     }

//     // address public DepositedAddress;
//     // function setDeposited(address _deposited) external onlyOwner {
//     //     DepositedAddress = _deposited;
//     // }
// }

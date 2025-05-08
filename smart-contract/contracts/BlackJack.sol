// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BlackJack is ERC721 {
    uint256 private _tokenId;
    address public owner;

    // 记录玩家的分数
    mapping(address => uint256) public scores;
    uint256 public constant CLAIM_SCORE = 1000;

    constructor() ERC721("BlackJackToken", "BJT") {
        owner = msg.sender;
        _tokenId = 0;
    }

    // 更新玩家的分数
    function updateScore(address player, uint256 score) external {
        scores[player] = score;
    }

    // 领取代币(每1000分兑换1个)
    function claimTokens(address player) external {
        require(scores[player] >= CLAIM_SCORE, "Score is not enough");
        uint256 tokenCount = scores[player] / CLAIM_SCORE; // 计算可以铸造的代币数量
        scores[player] -= tokenCount * CLAIM_SCORE; // 更新玩家的分数
        _batchMint(player, tokenCount);
    }

    // 铸造新的代币
    function _batchMint(address recipient, uint256 quantity) internal {
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(recipient, _tokenId);
            _tokenId++;
        }
    }

    // 提取代币
    // function withdrawTokens(address to, uint256 tokenId) public {
    //     require(
    //         _isApprovedOrOwner(_msgSender(), tokenId),
    //         "Not approved or owner"
    //     );
    //     _transfer(_mgsSender, to, tokenId);
    // }
}

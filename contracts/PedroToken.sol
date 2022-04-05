//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract PedroToken is ERC20, ERC20Permit, ERC20Votes {
    address private deployerWallet;

    constructor(uint256 initialSupply) ERC20("PedroToken", "PDT") ERC20Permit("PedroToken") {
        deployerWallet = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    modifier restricted() {
        require(msg.sender == deployerWallet, "Only deployer wallet can perform this action");

        _;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }

    // TODO: Change contract to mint tokens whenever ETH is transfered to it
    // TODO: Take into account ETH force-feeding https://consensys.github.io/smart-contract-best-practices/attacks/force-feeding/

    // TODO: Get rid of this admin minting function
    function mintMore(uint256 additionalSupply) public restricted {
        _mint(msg.sender, additionalSupply);
    }

    // TODO: Check redeeming

    // Note: Since the decimals() function wasn't overridden, the unit value will be divided by 10^18 before being
    // displayed to the user - This follows the same WEI to ETH conversion
}

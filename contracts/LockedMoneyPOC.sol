// SPDX-License-Identifier: MIT
// @author asimranov

pragma solidity ^0.8.0;

library DummyStakeCalculator {
    /// Does nothing, but call to this function leads to transaction failure
    function calculateMoneyToWithdraw() external pure returns (uint256 money) {
        return 1337;
    }
}

contract LockedMoneyPOC {
    function withdrawMoney() public {
        /// Fails because of library function call. So money are locked within protocol. If call removed, this function starts to work.
        uint256 newRecoveryRequestCode = DummyStakeCalculator.calculateMoneyToWithdraw();
        /// Tokens or ether transfer from the protocol here
    } 
}

### Report reference repository
https://github.com/asimaranov/zkSyncAccountAbstractionIssues

Finding Severity breakdown
--------------------------

All vulnerabilities discovered during the audit are classified based on their potential severity and have the following classification:

Severity | Description
--- | ---
Critical | Bugs leading to assets theft, fund access locking, or any other loss funds to be transferred to any party.
High     | Bugs that can trigger a contract failure. Further recovery is possible only by manual modification of the contract state or replacement.
Medium   | Bugs that can break the intended contract logic or expose it to DoS attacks, but do not cause direct loss funds.


Findings
------------

### Critical
#### LOCKED_MONEY_WHEN_LIBRARY_FUNCTION_IS_CALLED
##### Description
Library calls is some cases lead to transaction revertion. This is shown in [LockedMoneyPOC.sol](https://github.com/asimaranov/zkSyncAccountAbstractionIssues/blob/main/contracts/LockedMoneyPOC.sol) file. It contains the following code: 
```solidity
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
```

This function call reverts because of library call – `DummyStakeCalculator.calculateMoneyToWithdraw()`. If I remove this call, function is executed successfully. Script [deploy/deploy-locked-money-poc.ts](https://github.com/asimaranov/zkSyncAccountAbstractionIssues/blob/main/deploy/deploy-locked-money-poc.ts) contains demonstration of contract deployment and revert in `calculateMoneyToWithdraw` call. Can be launched using command `yarn hardhat compile && yarn hardhat deploy-zksync --script deploy/deploy-locked-money-poc.ts` 
Compiler throws no errors or warnings. A project that supports multiple chains and deployed to zkSync can notice money withdraw transaction revertion only when they already collected funds and want to withdraw it. Problem of unexpected revertion are more than real – similar problem with revert on zkSync `transfer` revertion caused 1.7M$ money loss for Gemholic project – https://twitter.com/gemholiceco?s=11&t=WLCBF4n6Xrvp7m_St3Q2WQ. I also reported this `transfer` behaviour problem and possible impact to zkSync team in December but it seems the problem was not properly considered. Moreover, if transfer problem displayed warnings in compiler, this problem even shows no warinings but reverts transaction.

##### Recommendation
Fix library calls revertion issue in zkSync 

# ZkSync issue reproduction

This project contains PoC of zkSync issues we faced with after network update

## Library calls leads to verification revert

If in the verification process in `validateTransaction` function any function from a library called, verification reverts with error `failed to validate the transaction. reason: Validation revert: Account validation error: Error function_selector = 0x, data = 0x`
File `LibraryInVerificationBugAccount.sol` demostrates the account with this issue. Any call from this account is failed if it contains `BugLibrary.bugFunction();` call. This call does nothing, it's just an empty function in an empty library but it reverts the validation. If I remove this call, transaction validation works fine. This is critical for us since we use our library to valudate requests from webauthn. 
To reproduce, run `yarn hardhat compile && yarn hardhat deploy-zksync --script deploy-library-in-verification.ts` with no modifications. It will revert with error `Account validation error: Error function_selector = 0x, data = 0x`. Then remove call `BugLibrary.bugFunction();` from `LibraryInVerificationBugAccount.sol` and launch the command again. Now it will not revert

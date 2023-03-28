import { Provider, types, utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script for account abstraction bugs reproduction`);

    const provider = new Provider('https://zksync2-testnet.zksync.dev');

    const wallet = new Wallet(process.env.PRIVATE_KEY!);

    const deployer = new Deployer(hre, wallet);
    const factoryArtifact = await deployer.loadArtifact('AAFactory');
    const aaArtifact = await deployer.loadArtifact('LibraryInVerificationBugAccount');

    const bytecodeHash = utils.hashBytecode(aaArtifact.bytecode);

    const factory = await deployer.deploy(
        factoryArtifact,
        [bytecodeHash],
        undefined,
        [
            aaArtifact.bytecode,
        ]
    );

    console.log(`AA factory address: ${factory.address}`);
    const accountCreationTx = await factory.deployAccount('0x0000000000000000000000000000000000000000000000000000000000000001');
    const accountCreationTxRc = await accountCreationTx.wait()

    const accountAddress = accountCreationTxRc.events.find((event: any) => event.event == 'AccountDeployed').args.account;

    await (
        await wallet.connect(provider).sendTransaction({
            to: accountAddress,
            value: ethers.utils.parseEther('0.05'),
        })
    ).wait();

    let aaTx = await factory.populateTransaction.deployAccount(
        "0x0000000000000000000000000000000000000000000000000000000000000002"
    );

    const gasLimit = await provider.estimateGas(aaTx);
    const gasPrice = await provider.getGasPrice();

    aaTx = {
        ...aaTx,
        from: accountAddress,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        chainId: (await provider.getNetwork()).chainId,
        nonce: await provider.getTransactionCount(accountAddress),
        type: 113,
        customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        } as types.Eip712Meta,
        value: ethers.BigNumber.from(0),
    };

    aaTx.customData = {
        ...aaTx.customData,
        customSignature: "0x00",
    };

    console.log(
        `The account nonce before the first tx is ${await provider.getTransactionCount(
            accountAddress
        )}`
    );

    /// @ 
    /// @ Error is throwed here. That's because a library function is called in verification
    /// @ If you navigate to LibraryInVerificationBugAccount.sol and remove call ```BugLibrary.bugFunction();```, this code will work file
    /// @ Before the last update it worked fine. It's critical for us since we implemented webauthn signature validator as a library 
    /// @ 

    const sentTx = await provider.sendTransaction(utils.serialize(aaTx));
    await sentTx.wait();

    // Checking that the nonce for the account has increased
    console.log(
        `The account nonce after the first tx is ${await provider.getTransactionCount(
            accountAddress
        )}`
    );





}

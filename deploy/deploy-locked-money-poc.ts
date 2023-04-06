import { Provider, types, utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
    console.log(`Running deploy script for locked money vulnerability PoC`);

    const provider = new Provider('https://zksync2-testnet.zksync.dev');

    const wallet = new Wallet(process.env.PRIVATE_KEY!);

    const deployer = new Deployer(hre, wallet);
    const LockedMoneyPOC = await deployer.loadArtifact('LockedMoneyPOC');
    
    const lockedMoneyPOC = await deployer.deploy(LockedMoneyPOC, []);

    console.log('Locked money PoC deployed to', lockedMoneyPOC);

    const withdrawMoneyTx = await lockedMoneyPOC.withdrawMoney();

    console.log(withdrawMoneyTx);
}

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@matterlabs/hardhat-zksync-toolbox";

const config: HardhatUserConfig = {  
  zksolc: {
    version: "1.3.5",
    compilerSource: "binary",
    settings: {
      isSystem: true
    },
    
  },
  networks: {
    zkTestnet: {
      url: "https://zksync2-testnet.zksync.dev", // URL of the zkSync network RPC
      ethNetwork: "goerli", // Can also be the RPC URL of the Ethereum network (e.g. `https://goerli.infura.io/v3/<API_KEY>`)
      zksync: true,
    },
  },
  defaultNetwork: "zkTestnet",
  solidity: "0.8.17",
};

export default config;

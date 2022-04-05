import * as dotenv from 'dotenv'

import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,

        // This parameter has nothing to do with the number iterations of iterations
        // performed by the optimizer. It will perform as many iterations as it deem necessary
        // to optimize the code.
        //
        // This is simply a setting to configure tradeoff between code size
        // (deploy cost) and execution costs. A number “1” will produce short but
        // expensive code. In contrast, a larger “runs” parameter will produce
        // longer but more gas efficient code
        runs: 1000,
      },
    },
  },

  // Setting the default network to Rinkeby will cause tests to use it
  // defaultNetwork: 'rinkeby',
  networks: {
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || '',
    //   accounts: process.env.ROPSTEN_PRIVATE_KEY !== undefined ? [process.env.ROPSTEN_PRIVATE_KEY] : [],
    // },
    rinkeby: {
      url: process.env.RINKEBY_URL || '',
      accounts: process.env.RINKEBY_PRIVATE_KEY !== undefined ? [process.env.RINKEBY_PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}

export default config

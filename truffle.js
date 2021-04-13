var HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = 'digital unknown jealous mother legal hedgehog save glory december universe spread figure custom found six'

if ( process.env.MNEMONIC_FILE ) {
  console.log( `== reading mnemonic file: ${process.env.MNEMONIC_FILE}`)
  mnemonic = require('fs').readFileSync(process.env.MNEMONIC_FILE, 'utf-8')
}

module.exports = {
  compilers: {
    solc: {
      version: '0.5.16',
      settings: {
        evmVersion: 'istanbul',
        optimizer: {
          enabled: true,
          runs: 200 // Optimize for how many times you intend to run the code
        }
      }
    }
  },
  networks: {
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/f40be2b1a3914db682491dc62a19ad43')
      },
      skipDryRun: true,
      network_id: 4
    },
    mainnet: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/v3/f40be2b1a3914db682491dc62a19ad43')
      },
      skipDryRun: true,
      network_id: 42
    },
    development: {
      // we run Ganache with chainID 1 to test the react app; no need for a dry run
      skipDryRun: true,
      provider: undefined,
      verbose: process.env.VERBOSE,
      gasPrice: (process.env.GASPRICE_GWEI*1e9).toString(),
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    }
  }
}

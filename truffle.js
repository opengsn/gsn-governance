var HDWalletProvider = require('truffle-hdwallet-provider')
let mnemonic

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
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/v3/f40be2b1a3914db682491dc62a19ad43')
      },
      skipDryRun: true,
      network_id: 3
    },
    mainnet: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/v3/f40be2b1a3914db682491dc62a19ad43')
      },
      skipDryRun: true,
      network_id: 1
    },
    development: {
      // we run Ganache with chainID 1 to test the react app; no need for a dry run
      skipDryRun: true,
      provider: mnemonic ? function () {
        return new HDWalletProvider(mnemonic, 'http://localhost:8545')
      } : null,
      verbose: process.env.VERBOSE,
      gasPrice: (process.env.GAS_PRICE_GWEI*1e9).toString(),
      gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : null,
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    }
  }
}

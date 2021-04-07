const fs = require('fs')
//this script should run in "gsn" folder..
const Timelock = artifacts.require('Timelock')
require( '../gsn-private/build/contracts/RelayHub.json')
// Transfer non-vested tokens
module.exports = async function (callback) {
  const hub = new web3.eth.Contract([
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
    ], process.env.RELAYHUB)

  const accounts = await web3.eth.getAccounts()
  await hub.methods.transferOwnership(Timelock.address).send({from:accounts[0]}).catch(e=>console.log(e))
  console.log('Done setting hub owner to Timelock')
  callback()
}

//this script should run in "gsn" folder..
const Timelock = artifacts.require('Timelock')

// Transfer non-vested tokens
module.exports = async function (callback) {
  try {
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
      ], process.env.RelayHubAddress)

    const accounts = await web3.eth.getAccounts()
    const currentOwner = await hub.methods.owner().call()
    const from = accounts[0]

    if (currentOwner === Timelock.address) {
      console.log('RelayHub: owner already set')
    } else
    if (currentOwner !== from) {
      console.error(`FATAL: RealyHub: current owner is ${currentOwner}, but from is ${from}. Can't setOwner`)
      process.exit(1)
    } else {
      await hub.methods.transferOwnership(Timelock.address).send({from}).catch(e=>console.log(e))
      console.log(`Done setting hub ${hub.options.address} owner to Timelock ${Timelock.address}`)
    }
    callback()
  } catch(e) {
    callback(e)
  }
}

//this script should run in "gsn" folder..
const {ownableAbi} = require("./OwnableAbi");

// Transfer non-vested tokens
module.exports = async function (callback) {
    try {
        for (contract of ['RelayHub', 'VersionRegistry']) {
            let contractAddress = process.env[contract + 'Address'];
            console.log(`${contract} at ${contractAddress}`)
            const hub = new web3.eth.Contract(ownableAbi, contractAddress)

            const accounts = await web3.eth.getAccounts()
            const currentOwner = await hub.methods.owner().call()
            const from = accounts[0]

            const timelockAddress = process.env.TIMELOCK
            if (currentOwner === timelockAddress) {
                console.log(`${contract}: owner already set`)
            } else if (currentOwner !== from) {
                console.error(`FATAL: ${contract}: current owner is ${currentOwner}, but from is ${from}.\n\tCan't setOwner to timelock ${timelockAddress}`)
                process.exit(1)
            } else {
                await hub.methods.transferOwnership(timelockAddress).send({from}).catch(e => console.log(e))
                console.log(`Done setting ${contract} @ ${hub.options.address} owner to Timelock ${timelockAddress}`)
            }
        }
        callback()
    } catch (e) {
        callback(e)
    }
}

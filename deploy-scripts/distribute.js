const { fromWei } = require('web3-utils')

const assert = require('assert')

const GSNToken = artifacts.require('GSNToken')
const Timelock = artifacts.require('Timelock')

// Transfer non-vested tokens
module.exports = async function (callback) {
  try {
    console.log('=== distributing unvested tokens ===')
    const accounts = await web3.eth.getAccounts()
    const timelock = await Timelock.deployed()
    const gsnToken = await GSNToken.deployed()

    // amounts are given in % of supply
    const totalSupply = await gsnToken.totalSupply()

    function percentToWei (pct) {
      return totalSupply.muln(Math.round(parseFloat(pct) * 1000)).divn(100000)
    }

    const deployerBalance1 = await gsnToken.balanceOf(accounts[0])
    console.log('=== deployerBalance', fromWei(deployerBalance1))
    console.log('=== totalSupply', fromWei(totalSupply))

    let distributedPercent = 0

    async function transfer (amount, destination, name) {
      distributedPercent += parseFloat(amount)
      const amountBN = percentToWei(amount)
      const balanceBefore = await gsnToken.balanceOf(destination)
      if (!balanceBefore.eqn(0)) {
        console.log(`FATAL: address ${destination} already have balance: ${balanceBefore.toString()}`)
      }
      await gsnToken.transfer(destination, amountBN)
      const balance = await gsnToken.balanceOf(destination)
      console.log(`=== distributed ${amount}% of total supply to ${name}:\n    current balance is ${fromWei(balance)} for address ${destination}`)
    }

    // non-vested funds
    await transfer(process.env.COMMUNITY_NO_VEST, timelock.address, 'community')
    // await transfer(process.env.AIRDROP_AMOUNT, process.env.AIRDROP, 'airdrop')

    // pre-vested funds
    await transfer(process.env.TEAM_AMOUNT_NO_VEST, process.env.TEAM_MULTISIG, 'team')
    // await transfer(process.env.EF_AMOUNT_NO_VEST, process.env.EF_MULTISIG, 'ef')
    // await transfer(process.env.ETC_AMOUNT_NO_VEST, process.env.ETC_MULTISIG, 'etc')
    await transfer(process.env.CHARITY_AMOUNT_NO_VEST, process.env.CHARITY_MULTISIG, 'charity')
    await transfer(process.env.ECOSYSTEM_AMOUNT_NO_VEST, process.env.ECOSYSTEM_MULTISIG, 'ecosystem')

    const deployerBalance2 = await gsnToken.balanceOf(accounts[0])
    console.log(`=== distributed ${distributedPercent}% of total supply without vesting`)
    console.log('=== deployerBalance', fromWei(deployerBalance2))
    const expectedExcess = percentToWei(process.env.EXPECTED_EXCESS_TOKENS)
    assert.equal(deployerBalance2.toString(), expectedExcess.toString(), `expected unallocated tokens: ${fromWei(expectedExcess)} but deployer still has ${fromWei(deployerBalance2)}`)
  } catch (e) {
    console.log('ex=', e)
    callback(e)
  }
  callback()
}

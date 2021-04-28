const BN = require('bn.js')
const assert = require('assert')
const { fromWei, toWei } = require('web3-utils')
const fs = require('fs')
const airdropVesting = require('../../gsn-airdrop/packages/merkle-distributor/build/vested-airdrop.json')

const GSNToken = artifacts.require('GSNToken')
const TreasuryVester = artifacts.require('TreasuryVester')

// Vesting uses Unix time (seconds-based), not javascript-time (ms-based)
let dateNow = Math.round(Date.now()/1000);

const day = 86400
const year = day * 365
const month = day * 30

const fullCycle = {
  vestingBegin: dateNow + 2 * month,
  vestingCliff: dateNow + 2 * month,
  vestingEnd: dateNow + 4 * year
}

// Transfer non-vested tokens
module.exports = async function (callback) {
  try {
    console.log('=== distributing vested airdrop tokens ===')
    const accounts = await web3.eth.getAccounts()
    const gsnToken = await GSNToken.at(process.env.GSNTOKEN)

    const deployerBalance1 = await gsnToken.balanceOf(accounts[0])
    console.log('=== deployerBalance', fromWei(deployerBalance1))

    let distributedTokens = toWei('0', 'ether')

    async function transfer (amount, destination, name) {
      // NOTE: generated file contains values already in WEI!
      const amountWei = amount
      distributedTokens = new BN(distributedTokens).add(new BN(amountWei))
      const balanceBefore = await gsnToken.balanceOf(destination)
      if (!balanceBefore.eqn(0)) {
        console.log(`FATAL: address ${destination} already have balance: ${balanceBefore.toString()}`)
      }
      await gsnToken.transfer(destination, amountWei)
      const balance = await gsnToken.balanceOf(destination)
      console.log(`=== distributed ${amount} tokens to ${name}:\n    current balance is ${fromWei(balance)} for address ${destination}`)
    }

    const outputs={}

    // vested funds
    for (const sponsor of airdropVesting) {
      console.log(`=== deploying vester for ${sponsor.recipientName}`)
      const vester = await TreasuryVester.new(
        gsnToken.address,
        sponsor.recipientAddress,
        // NOTE: can not be cancelled
        '0x0000000000000000000000000000000000000000',
        sponsor.vestingAmount,
        fullCycle.vestingBegin,
        fullCycle.vestingCliff,
        fullCycle.vestingEnd,
        // NOTE: can delegate and vote
        true)
      await transfer(sponsor.vestingAmount, vester.address, sponsor.recipientName + ' Vesting Contract')

      outputs["VESTER_"+sponsor.recipientName.toUpperCase()] = vester.address
    }
    console.log(`finished distribution to airdrop vesting contracts (${distributedTokens} tokens), now distributing non-vested`)

    const outfile = process.env.VESTED_AIRDROP_OUT
    if (outfile) {
      console.log('== writing addresses to',outfile)
      fs.writeFileSync(outfile,
        `# network ${process.env.NETWORK} mainnet=${process.env.IS_MAINNET}\n` +
        Object.entries(outputs).map(([k,v])=>`export ${k}="${v}"`).join('\n'))
    }

    const deployerBalance2 = await gsnToken.balanceOf(accounts[0])
    console.log(`=== distributed ${fromWei(distributedTokens)} tokens in total`)
    console.log('=== deployerBalance', fromWei(deployerBalance2))
    const expectedExcess = process.env.EXPECTED_EXCESS_TOKENS_AFTER_VESTED_AIRDROP
    const expectedDistribution = process.env.EXPECTED_DISTRIBUTION_TOTAL_CHECKSUM
    assert.equal(distributedTokens.toString(), toWei(expectedDistribution), `expected total distributed tokens: ${expectedDistribution} but distributed ${fromWei(distributedTokens)}`)
    assert.equal(deployerBalance2.toString(), toWei(expectedExcess), `expected unallocated tokens: ${expectedExcess} but deployer still has ${fromWei(deployerBalance2)}`)
  } catch (e) {
    console.log('ex=', e)
    callback(e)
  }
  callback()
}

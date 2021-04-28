const BN = require('bn.js')
const assert = require('assert')
const { fromWei, toWei } = require('web3-utils')
const fs = require('fs')
const sponsorsVesting = require('./sponsors-vesting')

const GSNToken = artifacts.require('GSNToken')
const TreasuryVester = artifacts.require('TreasuryVester')

// Transfer non-vested tokens
module.exports = async function (callback) {
  try {
    console.log('=== distributing sponsor tokens ===')
    const accounts = await web3.eth.getAccounts()
    const gsnToken = await GSNToken.at(process.env.GSNTOKEN)

    const deployerBalance1 = await gsnToken.balanceOf(accounts[0])
    console.log('=== deployerBalance', fromWei(deployerBalance1))

    let distributedTokens = toWei('0', 'ether')

    async function transfer (amount, destination, name) {
      const amountWei = toWei(amount, 'ether')
      distributedTokens = new BN(distributedTokens).add(new BN(amountWei))
      const balanceBefore = await gsnToken.balanceOf(destination)
      if (!balanceBefore.eqn(0)) {
        console.log(`FATAL: address ${destination} already have balance: ${balanceBefore.toString()}`)
      }
      await gsnToken.transfer(destination, amountWei)
      const balance = await gsnToken.balanceOf(destination)
      console.log(`=== distributed ${amount} tokens to ${name}:\n    current balance is ${fromWei(balance)} for address ${destination}`)
    }

    outputs={}

      // vested funds
    for (const sponsor of sponsorsVesting) {
      console.log(`=== deploying vester for ${sponsor.name}`)
      const vester = await TreasuryVester.new(
        gsnToken.address,
        sponsor.recipient,
        '0x0000000000000000000000000000000000000000',
        toWei(sponsor.vestingAmount),
        sponsor.vestingBegin,
        sponsor.vestingCliff,
        sponsor.vestingEnd,
        sponsor.canVote)
      await transfer(sponsor.vestingAmount, vester.address, sponsor.name + ' Vesting Contract')

      outputs["VESTER_"+sponsor.name.replace( /Vesting/,'').toUpperCase()] = vester.address
    }
    console.log(`finished distribution to sponsor vesting contracts (${distributedTokens} tokens), now distributing non-vested`)

    const outfile = process.env.SPONSORS_OUT
    if (outfile) {
      console.log('== writing addresses to',outfile)
      fs.writeFileSync(outfile,
        `# network ${process.env.NETWORK} mainnet=${process.env.IS_MAINNET}\n` +
        Object.entries(outputs).map(([k,v])=>`export ${k}="${v}"`).join('\n'))
    }

    await transfer(process.env.PRETTY_AISLE_AMOUNT_NO_VEST, process.env.PRETTY_AISLE, 'PrettyAisle')
    await transfer(process.env.COFFEE_IMITATE_AMOUNT_NO_VEST, process.env.COFFEE_IMITATE, 'CoffeeImitate')
    await transfer(process.env.EXPLAIN_SAUCE_AMOUNT_NO_VEST, process.env.EXPLAIN_SAUCE, 'ExplainSauce')
    await transfer(process.env.SKIRT_DANCE_AMOUNT_NO_VEST, process.env.SKIRT_DANCE, 'SkirtDance')
    await transfer(process.env.GRANT_DRAW_AMOUNT_NO_VEST, process.env.GRANT_DRAW, 'GrantDraw')
    await transfer(process.env.MOTION_TONIGHT_AMOUNT_NO_VEST, process.env.MOTION_TONIGHT, 'MotionTonight')

    await transfer(process.env.WORRY__OFFICE_AMOUNT_NO_VEST, process.env.WORRY__OFFICE, 'Worry Office')
    await transfer(process.env.STEM__ONLINE_AMOUNT_NO_VEST, process.env.STEM__ONLINE, 'StemOnline')
    await transfer(process.env.DEBRIS__TOPPLE_AMOUNT_NO_VEST, process.env.DEBRIS__TOPPLE, 'DebrisTopple')
    await transfer(process.env.PEOPLE_EMBARK_AMOUNT_NO_VEST, process.env.PEOPLE_EMBARK, 'PeopleEmbark')

    const deployerBalance2 = await gsnToken.balanceOf(accounts[0])
    console.log(`=== distributed ${fromWei(distributedTokens)} tokens in total`)
    console.log('=== deployerBalance', fromWei(deployerBalance2))
    const expectedExcess = process.env.EXPECTED_EXCESS_TOKENS_AFTER_SPONSORS
    const expectedDistribution = process.env.EXPECTED_DISTRIBUTION_TOTAL_CHECKSUM
    assert.equal(distributedTokens.toString(), toWei(expectedDistribution), `expected total distributed tokens: ${expectedDistribution} but distributed ${fromWei(distributedTokens)}`)
    assert.equal(deployerBalance2.toString(), toWei(expectedExcess), `expected unallocated tokens: ${expectedExcess} but deployer still has ${fromWei(deployerBalance2)}`)
  } catch (e) {
    console.log('ex=', e)
    callback(e)
  }
  callback()
}

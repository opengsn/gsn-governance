const Uni = artifacts.require('Uni')
const Timelock = artifacts.require('Timelock')
const GovernorAlpha = artifacts.require('GovernorAlpha')
const TreasuryVester = artifacts.require('TreasuryVester')

module.exports = async function (deployer) {
  const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const minter = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const trustedForwarder = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab'
  const mintingAllowedAfter = Date.now() + 1
  await deployer.deploy(Uni, account, minter, mintingAllowedAfter, trustedForwarder)
  const admin = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const delay = 172800
  await deployer.deploy(Timelock, admin, delay)
  await deployer.deploy(GovernorAlpha, Timelock.address, Uni.address)

  const recipientDatas = [
    {
      address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
      vestingAmount: '100'
    }
  ]
  const vestingBegin = Date.now() + 1
  const vestingCliff = Date.now() + 100
  const vestingEnd = Date.now() + 1000

  for (const recipient of recipientDatas){
    await deployer.deploy(TreasuryVester,
      Uni.address,
      recipient.address,
      recipient.vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd)
  }
}

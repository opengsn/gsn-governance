import chai, { expect } from 'chai'
import { Contract, BigNumber } from 'ethers'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'

import TreasuryVester from '../../build/TreasuryVester.json'

import { governanceFixture } from '../fixtures'
import { mineBlock, expandTo18Decimals } from '../utils'

chai.use(solidity)

describe('scenario:TreasuryVester', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet, wallet1] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet], provider)

  let uni: Contract
  let timelock: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(governanceFixture)
    uni = fixture.gsnToken
    timelock = fixture.timelock
  })

  let treasuryVester: Contract
  let vestingAmount: BigNumber
  let vestingBegin: number
  let vestingCliff: number
  let vestingEnd: number
  let canVote: boolean
  beforeEach('deploy treasury vesting contract', async () => {
    const { timestamp: now } = await provider.getBlock('latest')
    vestingAmount = expandTo18Decimals(100)
    vestingBegin = now + 60
    vestingCliff = vestingBegin + 60
    vestingEnd = vestingBegin + 60 * 60 * 24 * 365
    canVote = false

    treasuryVester = await deployContract(wallet, TreasuryVester, [
      uni.address,
      timelock.address,
      wallet1.address,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
      canVote,
    ])

    // fund the treasury
    await uni.transfer(treasuryVester.address, vestingAmount)
  })

  it('setRecipient:fail', async () => {
    await expect(treasuryVester.setRecipient(wallet.address)).to.be.revertedWith(
      'TreasuryVester::setRecipient: unauthorized'
    )
  })

  it('delegate:fail~unauthorized', async () => {
    const treasuryVester1 = treasuryVester.connect(provider.getSigner(1))
    await expect(treasuryVester1.delegate(wallet.address)).to.be.revertedWith('TreasuryVester::delegate: unauthorized')
  })

  it('delegate:fail~not allowed', async () => {
    // deploy vesting treasury with EOA recipient
    const treasuryVester = await deployContract(wallet, TreasuryVester, [
      uni.address,
      wallet.address,
      wallet.address,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
      canVote,
    ])
    await expect(treasuryVester.delegate(wallet.address)).to.be.revertedWith(
      'TreasuryVester::delegate: not allowed to vote'
    )
  })

  it('delegate', async () => {
    // deploy vesting treasury with EOA recipient and permission to vote
    const canVoteNow = true
    const treasuryVester = await deployContract(wallet, TreasuryVester, [
      uni.address,
      wallet.address,
      wallet.address,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd,
      canVoteNow,
    ])
    // fund the treasury
    await uni.transfer(treasuryVester.address, vestingAmount)

    const currentVotesBefore = await uni.getCurrentVotes(wallet.address)
    expect(currentVotesBefore).to.be.eq(0)

    await treasuryVester.delegate(wallet.address)

    const currentVotesAfter = await uni.getCurrentVotes(wallet.address)
    expect(currentVotesAfter).to.be.eq(vestingAmount)
  })

  it('claim:fail', async () => {
    await expect(treasuryVester.claim()).to.be.revertedWith('TreasuryVester::claim: not time yet')
    await mineBlock(provider, vestingBegin + 1)
    await expect(treasuryVester.claim()).to.be.revertedWith('TreasuryVester::claim: not time yet')
  })

  // WARNING: this test intervenes with a flow but then cleans up its own mess
  it('should approve tokens to provided address', async function () {
    const uni1 = uni.connect(wallet1)
    const balanceBefore = await uni1.balanceOf(wallet1.address)
    expect(balanceBefore).to.be.eq(0)
    await uni1.transferFrom(treasuryVester.address, wallet1.address, vestingAmount)
    const balanceAfter = await uni1.balanceOf(wallet1.address)
    expect(balanceAfter).to.be.eq(vestingAmount)
    await uni1.transfer(treasuryVester.address, vestingAmount)
  })

  it('claim:~half', async () => {
    await mineBlock(provider, vestingBegin + Math.floor((vestingEnd - vestingBegin) / 2))
    await treasuryVester.claim()
    const balance = await uni.balanceOf(timelock.address)
    expect(vestingAmount.div(2).sub(balance).abs().lte(vestingAmount.div(2).div(10000))).to.be.true
  })

  it('claim:all', async () => {
    await mineBlock(provider, vestingEnd)
    await treasuryVester.claim()
    const balance = await uni.balanceOf(timelock.address)
    expect(balance).to.be.eq(vestingAmount)
  })
})

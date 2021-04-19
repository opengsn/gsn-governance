const minute = 60
const day = 86400
const year = day * 365
const month = day * 30

if (!process.env.NETWORK) {
  throw new Error('$NETWORK not set')
}

let fullCycle

// Vesting uses Unix time (seconds-based), not javascript-time (ms-based)
let dateNow = Math.round(Date.now()/1000);

if (process.env.IS_MAINNET) {
  console.warn('=== Using mainnet 4-years vesting period!')
  // on mainnet: 4 years with 2-month cliff
  fullCycle = {
    vestingBegin: dateNow + 2 * month,
    vestingCliff: dateNow + 2 * month,
    vestingEnd: dateNow + 4 * year
  }
} else {
  // TODO: non-mainnet use very short (15-min) cycles
  console.warn('=== Using very short vesting period!')
  fullCycle = {
    vestingBegin: dateNow + 10 * minute,
    vestingCliff: dateNow + 10 * minute,
    vestingEnd: dateNow + 30 * minute
  }
}

//first year starts 3 days into the future. all TXs must be mined before this time.
// (cant deploy TreasuryVesting with vestingBegin in the past)
const year1 = {
  vestingBegin: dateNow + 3 * day,
  vestingCliff: dateNow + 3 * day,
  vestingEnd: dateNow + year
}

const year2 = {
  vestingBegin: dateNow + year,
  vestingCliff: dateNow + year,
  vestingEnd: dateNow + 2 * year
}
const year3 = {
  vestingBegin: dateNow + 2 * year,
  vestingCliff: dateNow + 2 * year,
  vestingEnd: dateNow + 3 * year
}
const year4 = {
  vestingBegin: dateNow + 3 * year,
  vestingCliff: dateNow + 3 * year,
  vestingEnd: dateNow + 4 * year
}

module.exports = [
  {
    name: 'TeamVaultVesting',
    recipient: process.env.TEAM_MULTISIG,
    vestingAmount: process.env.TEAM_AMOUNT,
    canVote: true,
    canBeCancelled: true,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  // {
  //   name: 'SponsorsVestingVaultEF',
  //   recipient: process.env.EF_MULTISIG,
  //   vestingAmount: process.env.EF_AMOUNT,
  //   canVote: false,
  //   canBeCancelled: false,
  //   vestingBegin: fullCycle.vestingBegin,
  //   vestingCliff: fullCycle.vestingCliff,
  //   vestingEnd: fullCycle.vestingEnd,
  // },
  // {
  //   name: 'SponsorsVestingVaultETC',
  //   recipient: process.env.ETC_MULTISIG,
  //   vestingAmount: process.env.ETC_AMOUNT,
  //   canVote: false,
  //   canBeCancelled: false,
  //   vestingBegin: fullCycle.vestingBegin,
  //   vestingCliff: fullCycle.vestingCliff,
  //   vestingEnd: fullCycle.vestingEnd,
  // },
  {
    name: 'CommunityYear1',
    recipient: 'timelock',
    vestingAmount: process.env.COMMUNITY_YEAR_1_AMOUNT,
    canVote: false,
    canBeCancelled: true,
    vestingBegin: year1.vestingBegin,
    vestingCliff: year1.vestingCliff,
    vestingEnd: year1.vestingEnd,
  }, {
    name: 'CommunityYear2',
    recipient: 'timelock',
    vestingAmount: process.env.COMMUNITY_YEAR_2_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: year2.vestingBegin,
    vestingCliff: year2.vestingCliff,
    vestingEnd: year2.vestingEnd,
  },
  {
    name: 'CommunityYear3',
    recipient: 'timelock',
    vestingAmount: process.env.COMMUNITY_YEAR_3_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: year3.vestingBegin,
    vestingCliff: year3.vestingCliff,
    vestingEnd: year3.vestingEnd,
  },
  {
    name: 'CommunityYear4',
    recipient: 'timelock',
    vestingAmount: process.env.COMMUNITY_YEAR_4_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: year4.vestingBegin,
    vestingCliff: year4.vestingCliff,
    vestingEnd: year4.vestingEnd,
  },
  {
    name: 'EcosystemSupport',
    recipient: process.env.ECOSYSTEM_MULTISIG,
    vestingAmount: process.env.ECOSYSTEM_AMOUNT,
    canVote: false,
    canBeCancelled: true,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'Charity',
    recipient: process.env.CHARITY_MULTISIG,
    vestingAmount: process.env.CHARITY_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  }
]

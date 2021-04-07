const minute = 60
const year = 86400 * 365

// TODO: on mainnet set to 4 years with 2-month cliff
const fullCycle = {
  vestingBegin: Date.now() + 5 * minute,
  vestingCliff:  Date.now() + 10 * minute,
  vestingEnd:  Date.now() + 30 * minute
}

const year1 = {
  vestingBegin: Date.now(),
  vestingCliff: Date.now(),
  vestingEnd: Date.now() + year
}
const year2 = {
  vestingBegin: Date.now() + year,
  vestingCliff: Date.now() + year,
  vestingEnd: Date.now() + 2 * year
}
const year3 = {
  vestingBegin: Date.now() + 2 * year,
  vestingCliff: Date.now() + 2 * year,
  vestingEnd: Date.now() + 3 * year
}
const year4 = {
  vestingBegin: Date.now() + 3 * year,
  vestingCliff: Date.now() + 3 * year,
  vestingEnd: Date.now() + 4 * year
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
  {
    name: 'SponsorsVestingVaultEF',
    recipient: process.env.EF_MULTISIG,
    vestingAmount: process.env.EF_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'SponsorsVestingVaultETC',
    recipient: process.env.ETC_MULTISIG,
    vestingAmount: process.env.ETC_AMOUNT,
    canVote: false,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'CommunityYear1',
    recipient: 'timelock',
    vestingAmount: process.env.COMMUNITY_YEAR_1_AMOUNT,
    canVote: false,
    canBeCancelled: true,
    vestingBegin: year1.vestingBegin,
    vestingCliff: year1.vestingCliff,
    vestingEnd: year1.vestingEnd,
  },  {
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
    recipient: process.env.TEAM_MULTISIG,
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

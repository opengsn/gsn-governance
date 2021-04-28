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

module.exports = [
  {
    name: 'PrettyAisleVesting',
    recipient: process.env.PRETTY_AISLE,
    vestingAmount: process.env.PRETTY_AISLE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'CoffeeImitateVesting',
    recipient: process.env.COFFEE_IMITATE,
    vestingAmount: process.env.COFFEE_IMITATE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'ExplainSauceVesting',
    recipient: process.env.EXPLAIN_SAUCE,
    vestingAmount: process.env.EXPLAIN_SAUCE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'SkirtDanceVesting',
    recipient: process.env.SKIRT_DANCE,
    vestingAmount: process.env.SKIRT_DANCE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'GrantDrawVesting',
    recipient: process.env.GRANT_DRAW,
    vestingAmount: process.env.GRANT_DRAW_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'MotionTonightVesting',
    recipient: process.env.MOTION_TONIGHT,
    vestingAmount: process.env.MOTION_TONIGHT_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'WorryOfficeVesting',
    recipient: process.env.WORRY__OFFICE,
    vestingAmount: process.env.WORRY__OFFICE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'StemOnlineVesting',
    recipient: process.env.STEM__ONLINE,
    vestingAmount: process.env.STEM__ONLINE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'DebrisToppleVesting',
    recipient: process.env.DEBRIS__TOPPLE,
    vestingAmount: process.env.DEBRIS__TOPPLE_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  },
  {
    name: 'PeopleEmbarkVesting',
    recipient: process.env.PEOPLE_EMBARK,
    vestingAmount: process.env.PEOPLE_EMBARK_AMOUNT,
    canVote: true,
    canBeCancelled: false,
    vestingBegin: fullCycle.vestingBegin,
    vestingCliff: fullCycle.vestingCliff,
    vestingEnd: fullCycle.vestingEnd,
  }
]

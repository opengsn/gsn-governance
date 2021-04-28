const { fromWei } = require('web3-utils')
const minimist = require('minimist')

const TreasuryVester = artifacts.require('TreasuryVester')
const GSNToken = artifacts.require('GSNToken')

// Transfer non-vested tokens

function maxlen (a, val, key) {
  let ret = val.toString().length
  if (a > ret) ret = a
  if (key.length > ret)
    ret = key.length
  return ret
}

width = {}

function pad (title, val) {
  return ((val || '')).toString().padEnd(width[title], ' ')
}

function getAddrName (addr) {
  for (const e in process.env) {
    if (process.env[e].toLowerCase() === addr.toLowerCase())
      return e
  }
}

module.exports = async function status (callback) {
  try {
    //NOTE: we parse also truffle options...
    const args = minimist(process.argv.slice(2), {
      alias: {
        csv: 'c',
        tsv: 't',
        json: 'j',
        vestInfo: 'v',
        fullAddress: 'a',
      }
    })

    const useJson = args.json
    const useCsv = args.csv
    const useTsv = args.tsv
    const useVestInfo = args.vestInfo
    const useFullAddress = args.fullAddress

    if (!useJson && !useCsv && !useTsv) {
      console.log(`usage: truffle exec tokenstatus {--json|--csv|--tsv} [--vestInfo, --fullAddress]`)
      process.exit()
    }

    let accounts = await web3.eth.getAccounts()
    from = accounts[0]

    const timelockAddress = process.env.TIMELOCK
    process.env.CREATOR = from
    names = [
      'CREATOR',
      'GSNTOKEN',
      'GOVERNOR',
      'TIMELOCK',
      'TEAM_MULTISIG',
      'VESTER_TEAMVAULTVESTING',
      'ECOSYSTEM_MULTISIG',
      'VESTER_ECOSYSTEMSUPPORT',
      'CHARITY_MULTISIG',
      'VESTER_CHARITY',
      'VESTER_COMMUNITYYEAR1',
      'VESTER_COMMUNITYYEAR2',
      'VESTER_COMMUNITYYEAR3',
      'VESTER_COMMUNITYYEAR4',
      'PRETTY_AISLE',
      'VESTER_PRETTY_AISLE',
      'COFFEE_IMITATE',
      'VESTER_COFFEE_IMITATE',
      'EXPLAIN_SAUCE',
      'VESTER_EXPLAIN_SAUCE',
      'SKIRT_DANCE',
      'VESTER_SKIRT_DANCE',
      'GRANT_DRAW',
      'VESTER_GRANT_DRAW',
      'MOTION_TONIGHT',
      'VESTER_MOTION_TONIGHT',
      'WORRY__OFFICE',
      'VESTER_WORRY_OFFICE',
      'STEM__ONLINE',
      'VESTER_STEM_ONLINE',
      'DEBRIS__TOPPLE',
      'VESTER_DEBRIS_TOPPLE',
      'PEOPLE_EMBARK',
      'VESTER_PEOPLE_EMBARK'
    ]

    const date = x => new Date(x * 1000).toLocaleDateString()
    tok = await GSNToken.at(process.env.GSNTOKEN)
    totalSupply = await tok.totalSupply()
    total = fromWei(totalSupply)
    headerSet = new Set()
    results = await Promise.all(names.map(async (name) => {
      const addr = process.env[name]
      if (!addr) {
        console.log(`${name}: not deployed yet `)
        return
      }
      let vestInfo = {}
      const balance = await tok.balanceOf(addr).then(fromWei)
      let votes = await tok.getCurrentVotes(addr).then(fromWei)
      if (name.startsWith('VEST') && useVestInfo) {
        const vester = await TreasuryVester.at(addr)
        const vestingAmount = fromWei(await vester.vestingAmount())
        const vestingBegin = date(await vester.vestingBegin())
        const vestingCliff = date(await vester.vestingCliff())
        const vestingEnd = date(await vester.vestingEnd())
        const canDelegate = (await vester.canDelegate()).toString()
        const allowance = await tok.allowance(addr, timelockAddress).then(fromWei)
        const r = await vester.recipient()
        const recipient = getAddrName(r) || r
        const govApproval = parseInt(allowance) > parseInt(balance)
        vestInfo = { govApproval, canDelegate, vestingAmount, vestingBegin, vestingCliff, vestingEnd, recipient, votes }
      }
      shortaddr = useFullAddress ? addr : addr.slice(2, 6) + '..' + addr.slice(-4)
      result = { name, addr: shortaddr, balance, votes, ...vestInfo }
      Object.keys(result).forEach(h => {
        headerSet.add(h)
        width[h] = maxlen(width[h], result[h], h)
      })
      return result
    }))

    headers = Array.from(headerSet)
    if (useCsv) {
      console.log(headers.map(h => pad(h, h)).join(', '))
      results.forEach(line => { if (line) console.log(headers.map(h => pad(h, line[h])).join(', '))})
    }
    if (useTsv) {
      console.log(headers.join('\t'))
      results.forEach(line => { if (line) console.log(headers.map(h => line[h]).join('\t'))})
    }
    if (useJson) {
      console.log(results)
    }

  } catch (e) {
    console.log('ex=', e)
    callback(e)
  }
  callback()
}

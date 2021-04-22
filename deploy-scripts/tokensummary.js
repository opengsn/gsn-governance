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

module.exports = async function status (callback) {
  try {
    //NOTE: we parse also truffle options...
    const args = minimist(process.argv.slice(2), {
      alias: {
        csv: 'c',
        json: 'j',
        vestInfo: 'v',
        fullAddress: 'a',
        percent: '%'
      }
    })

    const useJson = args.json
    const useCsv = args.csv
    const useVestInfo = args.vestInfo
    const useFullAddress = args.fullAddress
    const usePct = args.percent

    if (!useJson && !useCsv) {
      console.log(`usage: truffle exec tokenstatus {--json|--csv} [--vestInfo, --fullAddress]`)
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
    ]

    const date = x => new Date(x * 1000).toLocaleDateString()
    tok = await GSNToken.at(process.env.GSNTOKEN)
    total = fromWei(await tok.totalSupply())
    headerSet = new Set()
    results = await Promise.all(names.map(async (name) => {
      const addr = process.env[name]
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
        vestInfo = { vestingAmount, vestingBegin, vestingCliff, vestingEnd, votes, canDelegate }
      }
      const allowance = await tok.allowance(addr, timelockAddress).then(fromWei)
      govApproval = parseInt(allowance) > parseInt(balance)
      shortaddr = useFullAddress ? addr : addr.slice(2, 6) + '..' + addr.slice(-4)
      result = { name, addr: shortaddr }
      if (usePct) {
        result = { ...result, balance, 'bal%': balance * 100 / total, votes, 'votes%': votes*100 / total }
      } else {
        result = { ...result, balance, votes }
      }
      result = { ...result, ...vestInfo }
      Object.keys(result).forEach(h => {
        headerSet.add(h)
        width[h] = maxlen(width[h], result[h], h)
      })
      return result
    }))

    headers = Array.from(headerSet)
    if (useCsv) {
      console.log(headers.map(h => pad(h, h)).join(', '))
      results.forEach(line => console.log(headers.map(h => pad(h, line[h])).join(', ')))
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

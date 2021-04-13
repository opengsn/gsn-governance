#!/usr/bin/env node
const Web3 = require('web3')
const fs = require('fs')
const decoder = require('ethereum-tx-decoder')
const {Transaction} = require('ethereumjs-tx')
const ethereumjsUtil = require('ethereumjs-util')
const minimist = require('minimist')

const readline = require('readline');

async function prompt(str) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return await new Promise(resolve => rl.question(str, resolve))
}

function toHex(val) {
    if (typeof val == 'number')
        return '0x' + val.toString(16)
    if (typeof val == 'string' && val.match(/^0x/))
        return val

    if (val.constructor.name == 'Buffer')
        return ethereumjsUtil.bufferToHex(val)
    if (val._hex)
        return val._hex

    throw new Error(`tohex: unknown type ${val.constructor.name} val ${val}`)
}

let addrToName

function initNames() {
    if (addrToName)
        return
    addrToName = {}

    for (let envVar in process.env) {
        addrToName[process.env[envVar].toLowerCase()] = envVar
    }
}

//helper: for printing:
// - remove the huge "data" element, and just leave data.length
// - if address appears in environment, then add the env. string
function printableTXData(obj) {
    const {data, ...printObj} = obj
    initNames()
    if (!printObj.to) {
        delete printObj.to
        printObj.created = toHex(ethereumjsUtil.generateAddress(
            ethereumjsUtil.toBuffer(obj.from),
            ethereumjsUtil.toBuffer(obj.nonce)))
    }
    for (key in printObj) {
        let val = printObj[key]
        if (!val) continue
        let name = addrToName[val.toString().toLowerCase()]
        if (name && val.match(/0x.{40}/)) {
            printObj[key] = `${name} (${val})`
        }
    }

    printObj['data.length'] = data.length / 2
    return printObj
}

async function run() {
    try {
        let unknown = false
        const options = minimist(process.argv.slice(2), {
            alias: {
                filename: 'f',
                url: 'u',
                nonce: 'n',
                exec: 'e',
                prompt: 'p',
                help: 'h',
                once: '1',
                noestimate: 'E',
                debug: 'd'
            },
            unknown: () => {
                console.log('unknown param');
                unknown = true
            }
        })

        if (!options.debug) {
            console.debug = () => {
            }
        }

        console.debug('options', options)
        if (options.help || !options.filename || !options.url || unknown) {
            console.log(`usage: ${process.argv[0]} [options]
- decode each tx (to display from/to/gas/etc)
- estimateGas
- if needed (--exec), send TX

options:            
    --filename {file} - TX file to read. output of "ganache --verbose --fork {url}" (or stream of "sendRawTransaction" json RPC calls)
    --nonce {n} - start with this nonce. ignore TXs with lower nonce
    --noestimate | -E - DONT do gas-estimate (for fast decoding)
    -once | -1 - abort after sending/checking a single tx
    --exec - actually submit TXs
    --prompt - prompt yes/no before actual exec send
`)
            process.exit(1)
        }
        provider = new Web3.providers.HttpProvider(options.url)

        const web3 = new Web3(provider)
        console.log('current block=', await web3.eth.getBlockNumber())
        const fileContent = fs.readFileSync(options.filename, 'ascii')
        let jsonStream = fileContent.trim().split('\n')
            .filter(line => line.match(/^ *>/)).map(line => line.replace(/^ *> /, ''))

        //convert stream into array of objects:
        const commandsArray = JSON.parse('['+ jsonStream.map(line => line.replace(/^}/, '}\n,')).join('\n').replace(/,$/, '') + ']')

        const sendCommands = commandsArray.filter(e => e.method == 'eth_sendRawTransaction')
        console.log({filename: options.filename, url: options.url})
        let checkNonce = false

        for (let i = 0; i < sendCommands.length; i++) {
            const sendtx = sendCommands[i];
            let rawTx = sendtx.params[0]
            const decoded = decoder.decodeTx(rawTx)
            const {nonce, to, data, value, gasPrice, gasLimit, v, r, s} = decoded
            console.log('tx', i + 1, '/', sendCommands.length, 'nonce=', nonce)
            if (options.nonce && nonce < options.nonce) {
                continue
            }
            const txData = {
                nonce: toHex(nonce),
                to,
                data,
                gasPrice: gasPrice._hex,
                gasLimit: gasLimit._hex,
                value: toHex(value),
                v: toHex(v),
                r,
                s
            }
            const tx = new Transaction(txData);
            let from = toHex(tx.getSenderAddress())

            if (!checkNonce) {
                checkNonce = true
                console.log('sender=', from, 'nonce=', await web3.eth.getTransactionCount(from))
            }
            let gasEstimation
            if (!options.noestimate) {
                //remove fields that can't be used in estimate:
                let {r: r1, s: s1, v: v1, gasPrice: g1, gasLimit: g2, ...estimateData} = txData
                estimateData.from = from
                console.debug('== estimate...', printableTXData(estimateData))

                gasEstimation = await web3.eth.estimateGas(estimateData)
                // .catch(e=>e.message)
                console.log('after est:', printableTXData({
                    gasPrice: gasPrice.toString(),
                    gasLimit: gasLimit.toString(),
                    gasEst: gasEstimation,
                    from,
                    to,
                    data
                }))
            }
            let forcePrompt = false
            if (gasEstimation > gasLimit.toString()) {
                console.log('== WARNING: gas estimate is higher that given gasLimit!')
                forcePrompt = true
            }

            if (options.exec) {
                if (options.prompt || forcePrompt) {
                    await prompt("press ENTER to send")
                }
                console.log('=== sending ...')
                const ret = await web3.eth.sendSignedTransaction(rawTx)
                console.log('\rsend ret=', ret)
            }
            if (options.once)
                break
        }
    } catch (e) {
        //remove "node_modules" references from stack.
        e.stack = e.stack && e.stack.toString().replace(/.*node_modules.*\n/g, '')
        console.log(e)
    }
}

run().finally(process.exit)

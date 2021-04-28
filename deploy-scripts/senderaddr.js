module.exports = async function (callback) {
  try {
    accounts = await web3.eth.getAccounts()
    console.log(`SENDER=${accounts[0]}`)
    callback()
  } catch (e) {
    callback(e)
  }
}

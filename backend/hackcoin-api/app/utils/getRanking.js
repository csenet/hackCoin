const db = require('../controllers/dbController')
const web3 = require('../controllers/web3Contoller')

db.initialize().then((res) => {
  db.getAllUser().then(async (data) => {
    let promises = data.map(async (user) => {
      const address = user.address;
      const name = user.account.fullName;
      const balance = await web3.getBalance(address)
      return {
        address: address,
        name: name,
        balance: balance
      };
    })
    let ranking = await Promise.all(promises)
    sortData(ranking)
    process.exit(1)
  })
})

function sortData(data) {
  data.sort((a, b) => {
    return a.balance > b.balance ? -1 : 1
  })
  console.log("今週のHackCoinランキング！")
  data.map((user, index) => {
    console.log('%d:%dHACK: %s', index + 1, user.balance, user.name)
  })
}

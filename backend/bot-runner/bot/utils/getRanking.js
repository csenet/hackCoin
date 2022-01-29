const db = require('../controllers/dbController')
const web3 = require('../controllers/web3Contoller')
const {getAllUser} = require("../controllers/dbController");

exports.getRanking = async function (title) {
  await db.initialize();
  const data = await getAllUser()
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
  return sortData(ranking,title)
}

function sortData(data,title) {
  let output = "";
  data.sort((a, b) => {
    return a.balance > b.balance ? -1 : 1
  })
  output += title?title+"\n":"今週のHackCoinランキング！\n";
  data.map((user, index) => {
    output += `${index + 1}: ${user.balance}Hack: ${user.name}\n`;
  })
  return output
}

const Web3 = require("../controllers/web3Contoller");
const settings = require("../controllers/settings.json");

const fs = require('fs');
const csv = require('csv');


const parser = csv.parse({from_line: 2}, (error, data) => {
  const newData = []
  data.forEach((element, index, array) => {
    let row = {
      "address": element[0],
      "amount": Number(element[1])
    }
    newData.push(row)
  })
  send(newData)
});

//読み込みと処理を実行

// fs.createReadStream('data.csv').pipe(parser)

// async function send(data) {
//   for (let i = 0; i < data.length; i++) {
//     let address = data[i].address
//     let amount = data[i].amount
//     await Web3.sendToken(settings.address, address, amount)
//   }
// }


  Web3.sendToken(settings.address, "0xEF0Dd4aeE97cEBd8A1651D0bd964EfE1E1aA596c", 1).then(() => {
    console.log("success")
  }).catch((err) => {
    console.log(err)
  })

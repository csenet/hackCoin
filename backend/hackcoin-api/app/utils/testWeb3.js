const Web3 = require("../controllers/web3Contoller");
const settings = require("../controllers/settings.json");
const test = async () => {
  await Web3.sendToken(settings.address, "0x523255e13aDB9F02B148B5C79F9C77A5f02494E8", 30)
}

test().then( e=>console.log(e) );

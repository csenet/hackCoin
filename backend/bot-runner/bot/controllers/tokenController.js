/*
  Token Controller
 */

const {getUserAddress, getUserAddressByName} = require("./dbController");
const Web3 = require('../controllers/web3Contoller')
exports.sendToken = async (req, res) => {


  const from = req.query.from; // 送金元
  const to = req.query.to; // 送金先
  const value = req.query.value;  // 金額

  console.log(from, to, value)

  if (!from) return res.status(400).json({error: '送金元が空です'})

  // 送金元が空の場合
  if (!from) {
    return res.status(400).json({
      error: '送金元が空です'
    });
  }
  // 送金先が空の場合
  if (!to) {
    return res.status(400).json({
      error: '送金先が空です'
    });
  }
  // 金額が空の場合
  if (!value) {
    return res.status(400).json({
      error: '金額が空です'
    });
  }
  // 金額が不正な場合
  if (value < 0) {
    return res.status(400).json({
      error: '金額が不正です'
    });
  }
  console.log(await getUserAddressByName(from));
  const fromAddress = await getUserAddressByName(from);
  const toAddress = await getUserAddressByName(to);
  if (fromAddress === null || toAddress === null) {
    return res.status(400).json({error: '送金元または送金先が存在しません'})
  }

  await Web3.sendToken(fromAddress, toAddress, value)
}

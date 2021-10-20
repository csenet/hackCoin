const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}?retryWrites=true&w=majority`)
require('../models/user')
const User = mongoose.model('Users')

const wallet = require("./accountController");

exports.initialize = async function () {
  await wallet.initialize()
}

exports.getUserAddress = async function (id) {
  const userData = await User.findOne({ 'account.id': id })
  if (!userData) return null
  return userData.address
}

exports.updateAddress = async function (id, address, account) {
  if (await User.findOne({ 'account.id': id })) {
    // 更新
    await User.findOneAndUpdate(
      { 'account.id': id },
      {
        account: account,
        address: address
      },
      { new: true }
    )
  }
}

exports.getNextIndex = async function () {
  const lastDoc = await User.findOne({}, {}, {
    sort: {
      'index': -1
    }
  });
  return lastDoc ? lastDoc.index + 1 : 0;
}

let INDEX = 0;

exports.createUser = async function (id, account) {
  // const lastDoc = await User.findOne({}, [], {
  //   sort: {
  //     'index': 1
  //   }
  // });
  // const index = lastDoc ? lastDoc.index + 1 : 0;
  const index = INDEX;
  INDEX++;
  const address = wallet.getAccountByIndex(index)
  console.log(address)
  // 新規作成
  const userInfo = new User({
    id: id,
    index: index,
    account: account,
    address: address
  })
  await userInfo.save()
}


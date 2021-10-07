const mongoose = require("mongoose"),
  User = mongoose.model('Users')

exports.getUserAddress = async function (id) {
  const userData = await User.findOne({'account.id': id})
  if (!userData) return null
  return userData.address
}

exports.updateAddress = async function (id, address, account) {
  if (await User.findOne({'account.id': id})) {
    // 更新
    await User.findOneAndUpdate(
      {'account.id': id},
      {
        account: account,
        address: address
      },
      {new: true}
    )
  } else {
    // 新規作成
    const userInfo = new User({
      account: account,
      address: address
    })
    await userInfo.save()
  }
}

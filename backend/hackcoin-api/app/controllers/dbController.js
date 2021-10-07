const mongoose = require("mongoose"),
  User = mongoose.model('Users')

exports.getUserAddress = async function (id) {
  const userData = await User.findOne({'account.id': id})
  if (!userData) return null
  return userData.address
}

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  typetalkId: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Users", UserSchema)

const mongoose = require("mongoose"),
  User = mongoose.model('Users')

exports.webhook = async (req, res) => {
  const data = req.body
  const postId = data.post.id;
  const command = data.post.message;

  let message = "";

  if (command.match(/^hello/)) {
    message = echoBot(data);
  } else if (command.match(/^register .*/)) {
    message = await register(data);
  }

  const reply = message ? {"message": message, "replyTo": postId} : {}
  res.json(reply)
}

function echoBot(data) {
  const userName = data.post.account.fullName;
  return `Hello! ${userName}`
}

async function register(data) {
  const token = data.post.message.split(' ')
  if (token.length != 2) {
    return "Error: Invalid Command"
  }
  const address = token[1];
  const account = data.post.account;
  if (await User.findOne({'account.id': data.post.account.id})) {
    // 更新
    await User.findOneAndUpdate(
      {'account.id': data.post.account.id},
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
  return `Successfully registered!\n address: ${address}`
}

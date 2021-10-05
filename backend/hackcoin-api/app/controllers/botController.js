const mongoose = require("mongoose"),
  User = mongoose.model('Users')

exports.webhook = async (req, res) => {
  const data = req.body
  const postId = data.post.id;
  const command = data.post.message;

  let message = "";

  if (command.match(/hello/)) {
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
  const userId = data.post.account.id;
  if (await User.findOne({typetalkId: userId})) {
    // 更新
    await User.findOneAndUpdate(
      {typetalkId: userId},
      {
        typetalkId: userId,
        address: address
      },
      {new: true}
    )
  } else {
    // 新規作成
    const userInfo = new User({
      typetalkId: userId,
      address: address
    })
    await userInfo.save()
  }
  return `Successfully registered!\n address: ${address}`
}

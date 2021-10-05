/* TypeTalk Bot */

// const topicName = data.topic.name;
// const message = data.post.message;
// const postId = data.post.id;
// const account = data.post.account;
//
// const accountId = account.id;
// const accountName = account.name;

// const web3 = require('./web3/test')

const botInterface = async (data, res) => {
  const postId = data.post.id;
  const command = data.post.message;

  let message = "";

  switch (command) {
    case "hello":
      message = echoBot(data);
      break;
    // case "tx":
    //   message = await web3(res, postId)
    //   break;
  }

  const reply = message ? {"message": message, "replyTo": postId} : {}

  res.json(reply);
}

function echoBot(data) {
  const userName = data.post.account.fullName;

  return `Hello! ${userName}`
}

module.exports = botInterface;

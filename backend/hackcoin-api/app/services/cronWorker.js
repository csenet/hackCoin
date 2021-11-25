// 定期実行
const {sendMessage} = require('../controllers/typetalkController.js')
const {getRanking} = require('../utils/getRanking.js')

exports.showRanking = function (isDev) {
  const to = isDev ? 'https://typetalk.com/api/v1/topics/257278' : 'https://typetalk.com/api/v1/topics/261759';
  getRanking().then((res) => {
    sendMessage(res, to)
  })
}


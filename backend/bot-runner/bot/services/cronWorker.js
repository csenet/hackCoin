// 定期実行
const {sendMessage} = require('../controllers/typetalkController.js')
const {getRanking} = require('../utils/getRanking.js')

exports.showRanking = function (isDev,title) {
  const to = isDev ? 'https://typetalk.com/api/v1/topics/257278' : 'https://typetalk.com/api/v1/topics/261759';
  const token = isDev ? '5mEGtfq0sF6EZAkSBfEeAcj7n5F8HqDXPwbaC5TtM7BBFe9wTxRHhX6m9hApVLmw':'ogfXPZ0mayegp9Diqws0vUSua8ywycYvvPrbdtlIPQWqM2PKycNz5olmmWL2TrrF';
  getRanking(title).then((res) => {
    sendMessage(res, to,token)
  })
}


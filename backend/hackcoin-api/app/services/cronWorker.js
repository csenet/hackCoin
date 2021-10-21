// 定期実行
const {sendMessage} = require('../controllers/typetalkController.js')
const {getRanking} = require('../utils/getRanking.js')

exports.showRanking = function (){
  getRanking().then((res) => {
    sendMessage(res)
  })
}


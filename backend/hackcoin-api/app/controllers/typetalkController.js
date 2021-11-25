const axios = require('axios');
const qs = require('qs');

exports.sendMessage = function (message,to) {
  const data = qs.stringify({
    'message': message
  });
  const config = {
    method: 'post',
    url: to,
    headers: {
      'X-TYPETALK-TOKEN': '5mEGtfq0sF6EZAkSBfEeAcj7n5F8HqDXPwbaC5TtM7BBFe9wTxRHhX6m9hApVLmw',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
  };
  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}

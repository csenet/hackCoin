const axios = require('axios');
const qs = require('qs');

exports.sendMessage = function (message) {
  const data = qs.stringify({
    'message': message
  });
  const config = {
    method: 'post',
    url: 'https://typetalk.com/api/v1/topics/257278',
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

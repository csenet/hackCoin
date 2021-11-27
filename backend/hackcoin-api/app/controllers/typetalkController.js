const axios = require('axios');
const qs = require('qs');

exports.sendMessage = function (message,to,token) {
  const data = qs.stringify({
    'message': message
  });
  const config = {
    method: 'post',
    url: to,
    headers: {
      'X-TYPETALK-TOKEN': token,
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

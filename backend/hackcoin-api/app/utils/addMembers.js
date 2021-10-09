var axios = require('axios');
var FormData = require('form-data');
var data = new FormData();

var config = {
  method: 'get',
  url: 'https://typetalk.com/api/v1/spaces/ttaxgMT8FO/teams/QG9e3T',
  headers: {
    'Authorization': 'Bearer MrbdPk18m9mLhdl1TVGBQalrAGgq33Uqsi7nso5Sns0kKPCtJOIleojwTzvplfxN',
    'Cookie': 'csrf=ba1159b5bd3cdadb06e381e3f64ab5c88df6964f-1633725829709-837cc82ea68c62659bee704e',
    ...data.getHeaders()
  },
  data: data
};

const db = require('../controllers/dbController');

axios(config)
  .then(function (response) {
    const members = response.data.members;
    db.initialize().then(r => {
        members.forEach(async (res) => {
          await db.createUser(res.id, res)
        })
      }
    )
  })
  .catch(function (error) {
    console.log(error);
  });

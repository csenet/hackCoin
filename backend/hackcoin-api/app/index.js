// Redis
require('./services/redisWorker')

// Websocket
require('./services/typetalkWorker')

const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  router = require('./routes/router')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/', router)

app.listen(8080)
